import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import Stripe from "stripe";
import { getMainDatabase } from './index';

// Force redeploy - updated webhook secret
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('The STRIPE_SECRET_KEY environment variable is not set. The app will not work correctly in a deployed environment.');
}

// Initialize Stripe with the secret key from environment variables
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null;

// v2 Cloud Function to create a checkout session
export const createStripeCheckoutSession = onCall(async (request) => {
  logger.info("🚀 createStripeCheckoutSession function triggered");
  logger.info("Environment check:", {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
  });

  if (!stripe) {
    logger.error("Stripe is not configured. Ensure STRIPE_SECRET_KEY is set.");
    throw new HttpsError('internal', 'Stripe is not configured.');
  }
  logger.info("Stripe configured correctly.");

  // Check if user is authenticated
  if (!request.auth) {
    logger.warn("Unauthenticated user tried to call createCheckoutSession.");
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  logger.info(`Authenticated user: ${request.auth.uid}`);

  const { priceId, origin } = request.data;
  const userId = request.auth.uid;

  logger.info("Initiating Stripe checkout session creation with data:", {
    userId,
    priceId,
    origin,
  });

  if (!priceId) {
    logger.error("priceId is missing from the request.");
    throw new HttpsError("invalid-argument", "priceId is required.");
  }
  if (!origin) {
    logger.warn("origin is missing from the request. Using default URLs.");
  }

  const successUrl = origin ? `${origin}/profile?session_id={CHECKOUT_SESSION_ID}` : `https://lady-qr.web.app/profile?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = origin ? `${origin}/pricing` : `https://lady-qr.web.app/pricing`;

  logger.info(`Using successUrl: ${successUrl} and cancelUrl: ${cancelUrl}`);

  try {
    logger.info(`Fetching user document for userId: ${userId}`);
    const db = getMainDatabase();
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data();

    if (!user) {
      logger.error("User not found in Firestore.", { userId });
      throw new HttpsError("not-found", "User not found.");
    }
    logger.info("User document found in Firestore.");

    // Get or create a Stripe customer
    let customerId = user.stripeCustomerId;

    // Check if we have a customer ID and verify it exists in the current Stripe mode
    if (customerId) {
      try {
        logger.info(`Verifying existing Stripe customer ID: ${customerId}`);
        await stripe.customers.retrieve(customerId);
        logger.info(`Existing Stripe customer verified: ${customerId}`);
      } catch (error: any) {
        // Customer doesn't exist (likely test mode customer in live mode or vice versa)
        if (error.code === 'resource_missing') {
          logger.warn(`Stripe customer ${customerId} not found in current mode. Creating new customer.`, {
            error: error.message
          });
          customerId = ''; // Reset to create new customer
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    // Create new customer if needed
    if (!customerId) {
      logger.info("Creating new Stripe customer.", { userId, email: user.email });
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;
      logger.info(`New Stripe customer created: ${customerId}`);
      // Save the new customer ID to the user's document in Firestore
      await userDoc.ref.update({ stripeCustomerId: customerId });
      logger.info(`Stripe customer ID ${customerId} saved to user document.`);
    }

    logger.info("Creating Stripe checkout session with data:", { customerId, priceId, successUrl, cancelUrl });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: userId,
        planId: priceId,
      }
    });

    logger.info("✅ Stripe session created successfully!", {
      sessionId: session.id,
      // Avoid logging the entire session object in production
      // sessionObject: JSON.stringify(session),
    });

    if (!session.id) {
      logger.error("Stripe session.id is missing after creation.");
      throw new HttpsError("internal", "Failed to create a Stripe session.");
    }

    return { sessionId: session.id };
  } catch (error) {
    logger.error("❌ Error during Stripe checkout session creation", {
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      userId,
      priceId,
    });
    if (error instanceof Error) {
        logger.error("Stripe Checkout Error:", error.message);
        throw new HttpsError(
          "internal",
          "An error occurred while creating the checkout session.",
          error.message
        );
    }
    logger.error("Unknown Stripe Checkout Error:", error);
    throw new HttpsError(
      "internal",
      "An unknown error occurred while creating the checkout session."
    );
  }
});

// Map Stripe price IDs to plan types
const PRICE_TO_PLAN_MAP: { [key: string]: string } = {
  'price_1SPdCcDUi8OxbbECORoClMl6': 'basic', // Basic plan - $5/month
  'price_1S5fztDUi8OxbbECZPInb8rQ': 'basic', // Old Basic price ID (keep for legacy subscriptions)
};

export const stripeWebhook = onRequest(async (request, response) => {
  if (!stripe) {
    console.error('Stripe is not configured.');
    response.status(500).send('Stripe is not configured.');
    return;
  }
  const sig = request.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Stripe webhook secret is not set.');
    response.status(400).send('Webhook secret not configured.');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (!event) {
    console.error('Stripe event is null.');
    response.status(500).send('Stripe event is null.');
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.firebaseUID && session.metadata?.planId) {
        const userId = session.metadata.firebaseUID;
        const priceId = session.metadata.planId;

        // Map price ID to plan type
        const planType = PRICE_TO_PLAN_MAP[priceId] || 'free';

        logger.info('Processing checkout.session.completed', {
          userId,
          priceId,
          planType,
          subscriptionId: session.subscription
        });

        // Find existing active subscription for this user
        const db = getMainDatabase();
        const subscriptionsRef = db.collection('subscriptions');
        const existingSubQuery = await subscriptionsRef
          .where('userId', '==', userId)
          .where('status', '==', 'active')
          .limit(1)
          .get();

        if (!existingSubQuery.empty) {
          // Update existing subscription
          const subDocRef = existingSubQuery.docs[0].ref;
          await subDocRef.update({
            planType: planType,
            status: 'active',
            stripeSubscriptionId: session.subscription,
            cancelAtPeriodEnd: false,
            updatedAt: new Date()
          });
          logger.info('Updated existing subscription', { subscriptionId: subDocRef.id });
        } else {
          // Create new subscription
          const newSubscription = {
            id: `sub_${userId}_${Date.now()}`,
            userId: userId,
            planType: planType,
            status: 'active',
            stripeSubscriptionId: session.subscription,
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await subscriptionsRef.doc(newSubscription.id).set(newSubscription);
          logger.info('Created new subscription', { subscriptionId: newSubscription.id });
        }

        // Also update user document for quick reference
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
          planType: planType,
          subscriptionStatus: 'active',
            stripeCustomerId: session.customer,
          subscriptionUpdatedAt: new Date()
        });
        logger.info('Updated user document with plan info');
      }
      break;
    }
    case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Processing customer.subscription.deleted', { subscriptionId: subscription.id });

        const db = getMainDatabase();
        const subscriptionsRef = db.collection('subscriptions');
        const subscriptionQuery = await subscriptionsRef
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();

        if (!subscriptionQuery.empty) {
            const subDoc = subscriptionQuery.docs[0];
            await subDoc.ref.update({
                status: 'cancelled',
                updatedAt: new Date()
            });

            // Also update user document
            const userId = subDoc.data().userId;
            if (userId) {
              const userRef = db.collection('users').doc(userId);
              await userRef.update({
                subscriptionStatus: 'cancelled',
                subscriptionUpdatedAt: new Date()
              });
            }
            logger.info('Cancelled subscription', { subscriptionId: subDoc.id });
        }
        break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
});