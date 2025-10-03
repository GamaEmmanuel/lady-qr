import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publicKey) {
      console.error("Stripe publishable key is not set in .env.local");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publicKey);
  }
  return stripePromise;
};

export default getStripe;