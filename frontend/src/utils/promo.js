export const AVAILABLE_PROMOS = [
  {
    code: 'NEXT20',
    discountPercent: 20,
    minSubtotal: 1999,
    title: '20% OFF on orders above ₹1,999',
    description: 'Save 20% instantly when your cart subtotal is above ₹1,999.',
  },
];

export function evaluatePromo(rawCode, subtotal) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      promo: null,
      discountAmount: 0,
      finalTotal: subtotal,
      reason: 'Please enter a promo code.',
    };
  }

  const promo = AVAILABLE_PROMOS.find((p) => p.code === code);
  if (!promo) {
    return {
      valid: false,
      promo: null,
      discountAmount: 0,
      finalTotal: subtotal,
      reason: `Promo code "${code}" is invalid.`,
    };
  }

  if (subtotal <= promo.minSubtotal) {
    const needed = Math.max(1, promo.minSubtotal + 1 - subtotal);
    return {
      valid: false,
      promo,
      discountAmount: 0,
      finalTotal: subtotal,
      reason: `${promo.code} is applicable only above ₹${promo.minSubtotal.toLocaleString('en-IN')}. Add ₹${needed.toLocaleString('en-IN')} more to unlock 20% off.`,
    };
  }

  const discountAmount = Math.round((subtotal * promo.discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    promo,
    discountAmount,
    finalTotal,
    reason: '',
  };
}
