"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createStripeCheckoutSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('The STRIPE_SECRET_KEY environment variable is not set. The app will not work correctly in a deployed environment.');
}
// Initialize Stripe with the secret key from environment variables
const stripe = process.env.STRIPE_SECRET_KEY
    ? new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-08-27.basil",
    })
    : null;
// v2 Cloud Function to create a checkout session
exports.createStripeCheckoutSession = (0, https_1.onCall)(async (request) => {
    if (!stripe) {
        throw new https_1.HttpsError('internal', 'Stripe is not configured.');
    }
    // Check if user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { priceId, origin } = request.data;
    const userId = request.auth.uid;
    const successUrl = origin ? `${origin}/profile?session_id={CHECKOUT_SESSION_ID}` : `https://lady-qr.web.app/profile?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = origin ? `${origin}/pricing` : `https://lady-qr.web.app/pricing`;
    try {
        const userDoc = await admin.firestore().collection("users").doc(userId).get();
        const user = userDoc.data();
        if (!user) {
            throw new https_1.HttpsError("not-found", "User not found.");
        }
        // Get or create a Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await (stripe === null || stripe === void 0 ? void 0 : stripe.customers.create({
                email: user.email,
                metadata: {
                    firebaseUID: userId,
                },
            }));
            customerId = customer === null || customer === void 0 ? void 0 : customer.id;
            // Save the new customer ID to the user's document in Firestore
            await userDoc.ref.update({ stripeCustomerId: customerId });
        }
        // Create a Stripe checkout session
        const session = await (stripe === null || stripe === void 0 ? void 0 : stripe.checkout.sessions.create({
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
        }));
        return { sessionId: session === null || session === void 0 ? void 0 : session.id };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Stripe Checkout Error:", error.message);
            throw new https_1.HttpsError("internal", "An error occurred while creating the checkout session.", error.message);
        }
        console.error("Unknown Stripe Checkout Error:", error);
        throw new https_1.HttpsError("internal", "An unknown error occurred while creating the checkout session.");
    }
});
exports.stripeWebhook = (0, https_1.onRequest)(async (request, response) => {
    var _a;
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
            if ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.firebaseUID) {
                const userRef = admin.firestore().collection('users').doc(session.metadata.firebaseUID);
                await userRef.update({
                    subscription: {
                        status: 'active',
                        planType: session.metadata.planId,
                        stripeSubscriptionId: session.subscription,
                        stripeCustomerId: session.customer,
                    },
                });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const userSnapshot = await admin.firestore().collection('users').where('stripeSubscriptionId', '==', subscription.id).get();
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                await userDoc.ref.update({
                    subscription: {
                        status: 'canceled',
                    },
                });
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    response.json({ received: true });
});
//# sourceMappingURL=stripe.js.map