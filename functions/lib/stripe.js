"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createStripeCheckoutSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const stripe_1 = __importDefault(require("stripe"));
const index_1 = require("./index");
// Force redeploy
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('The STRIPE_SECRET_KEY environment variable is not set. The app will not work correctly in a deployed environment.');
}
// Initialize Stripe with the secret key from environment variables
const stripe = process.env.STRIPE_SECRET_KEY
    ? new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        // @ts-ignore
        apiVersion: "2020-08-27",
    })
    : null;
// v2 Cloud Function to create a checkout session
exports.createStripeCheckoutSession = (0, https_1.onCall)(async (request) => {
    firebase_functions_1.logger.info("🚀 createStripeCheckoutSession function triggered");
    if (!stripe) {
        firebase_functions_1.logger.error("Stripe is not configured. Ensure STRIPE_SECRET_KEY is set.");
        throw new https_1.HttpsError('internal', 'Stripe is not configured.');
    }
    firebase_functions_1.logger.info("Stripe configured correctly.");
    // Check if user is authenticated
    if (!request.auth) {
        firebase_functions_1.logger.warn("Unauthenticated user tried to call createCheckoutSession.");
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    firebase_functions_1.logger.info(`Authenticated user: ${request.auth.uid}`);
    const { priceId, origin } = request.data;
    const userId = request.auth.uid;
    firebase_functions_1.logger.info("Initiating Stripe checkout session creation with data:", {
        userId,
        priceId,
        origin,
    });
    if (!priceId) {
        firebase_functions_1.logger.error("priceId is missing from the request.");
        throw new https_1.HttpsError("invalid-argument", "priceId is required.");
    }
    if (!origin) {
        firebase_functions_1.logger.warn("origin is missing from the request. Using default URLs.");
    }
    const successUrl = origin ? `${origin}/profile?session_id={CHECKOUT_SESSION_ID}` : `https://lady-qr.web.app/profile?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = origin ? `${origin}/pricing` : `https://lady-qr.web.app/pricing`;
    firebase_functions_1.logger.info(`Using successUrl: ${successUrl} and cancelUrl: ${cancelUrl}`);
    try {
        firebase_functions_1.logger.info(`Fetching user document for userId: ${userId}`);
        const db = (0, index_1.getMainDatabase)();
        const userDoc = await db.collection("users").doc(userId).get();
        const user = userDoc.data();
        if (!user) {
            firebase_functions_1.logger.error("User not found in Firestore.", { userId });
            throw new https_1.HttpsError("not-found", "User not found.");
        }
        firebase_functions_1.logger.info("User document found in Firestore.");
        // Get or create a Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            firebase_functions_1.logger.info("No Stripe customer ID found for user. Creating a new one.", { userId, email: user.email });
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    firebaseUID: userId,
                },
            });
            customerId = customer.id;
            firebase_functions_1.logger.info(`New Stripe customer created: ${customerId}`);
            // Save the new customer ID to the user's document in Firestore
            await userDoc.ref.update({ stripeCustomerId: customerId });
            firebase_functions_1.logger.info(`Stripe customer ID ${customerId} saved to user document.`);
        }
        else {
            firebase_functions_1.logger.info(`Using existing Stripe customer ID: ${customerId}`);
        }
        firebase_functions_1.logger.info("Creating Stripe checkout session with data:", { customerId, priceId, successUrl, cancelUrl });
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
        firebase_functions_1.logger.info("✅ Stripe session created successfully!", {
            sessionId: session.id,
            // Avoid logging the entire session object in production
            // sessionObject: JSON.stringify(session),
        });
        if (!session.id) {
            firebase_functions_1.logger.error("Stripe session.id is missing after creation.");
            throw new https_1.HttpsError("internal", "Failed to create a Stripe session.");
        }
        return { sessionId: session.id };
    }
    catch (error) {
        firebase_functions_1.logger.error("❌ Error during Stripe checkout session creation", {
            error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            userId,
            priceId,
        });
        if (error instanceof Error) {
            firebase_functions_1.logger.error("Stripe Checkout Error:", error.message);
            throw new https_1.HttpsError("internal", "An error occurred while creating the checkout session.", error.message);
        }
        firebase_functions_1.logger.error("Unknown Stripe Checkout Error:", error);
        throw new https_1.HttpsError("internal", "An unknown error occurred while creating the checkout session.");
    }
});
// Map Stripe price IDs to plan types
const PRICE_TO_PLAN_MAP = {
    'price_1SPdCcDUi8OxbbECORoClMl6': 'basic', // Basic plan - $5/month
    'price_1S5fztDUi8OxbbECZPInb8rQ': 'basic', // Old Basic price ID (keep for legacy subscriptions)
};
exports.stripeWebhook = (0, https_1.onRequest)(async (request, response) => {
    var _a, _b;
    if (!stripe) {
        console.error('Stripe is not configured.');
        response.status(500).send('Stripe is not configured.');
        return;
    }
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        console.error('Stripe webhook secret is not set.');
        response.status(400).send('Webhook secret not configured.');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) {
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
            const session = event.data.object;
            if (((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.firebaseUID) && ((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId)) {
                const userId = session.metadata.firebaseUID;
                const priceId = session.metadata.planId;
                // Map price ID to plan type
                const planType = PRICE_TO_PLAN_MAP[priceId] || 'free';
                firebase_functions_1.logger.info('Processing checkout.session.completed', {
                    userId,
                    priceId,
                    planType,
                    subscriptionId: session.subscription
                });
                // Find existing active subscription for this user
                const db = (0, index_1.getMainDatabase)();
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
                    firebase_functions_1.logger.info('Updated existing subscription', { subscriptionId: subDocRef.id });
                }
                else {
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
                    firebase_functions_1.logger.info('Created new subscription', { subscriptionId: newSubscription.id });
                }
                // Also update user document for quick reference
                const userRef = db.collection('users').doc(userId);
                await userRef.update({
                    planType: planType,
                    subscriptionStatus: 'active',
                    stripeCustomerId: session.customer,
                    subscriptionUpdatedAt: new Date()
                });
                firebase_functions_1.logger.info('Updated user document with plan info');
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            firebase_functions_1.logger.info('Processing customer.subscription.deleted', { subscriptionId: subscription.id });
            const db = (0, index_1.getMainDatabase)();
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
                firebase_functions_1.logger.info('Cancelled subscription', { subscriptionId: subDoc.id });
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    response.json({ received: true });
});
//# sourceMappingURL=stripe.js.map