import type { Product } from './product';

export interface CartLine {
  /** Stable composite key: productId:colorwayId:size */
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  colorwayId: string;
  colorwayName: string;
  size: string;
  price: number;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface AddToCartInput {
  product: Product;
  colorwayId: string;
  size: string;
  quantity?: number;
}

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface ShippingDetails {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  method: 'standard' | 'express';
}

export interface PaymentDetails {
  /** Deliberately not real card capture — this is a concept store. */
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}
