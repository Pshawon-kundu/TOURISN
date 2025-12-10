import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'bdt'
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
};

export const confirmPayment = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
};

export const refundPayment = async (paymentIntentId: string): Promise<Stripe.Refund> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return refund;
  } catch (error) {
    console.error('Stripe refund error:', error);
    throw error;
  }
};
