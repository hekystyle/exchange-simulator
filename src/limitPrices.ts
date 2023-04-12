import Decimal from 'decimal.js';

export const limitPrices = (currentPrice: number, availableFunds: number, amountPerOrder: number) => {
  const decreasedPrice = Decimal.mul(currentPrice, 0.7); // decrease price by 30%
  const diffPrice = Decimal.sub(currentPrice, decreasedPrice);

  const ordersCount = Decimal.div(availableFunds, amountPerOrder);
  const priceDecreasePerOrder = Decimal.div(diffPrice, ordersCount);

  return Array.from({ length: ordersCount.toNumber() }, (_, i) => {
    return Decimal.sub(currentPrice, Decimal.mul(priceDecreasePerOrder, i + 1)).toNumber();
  });
};
