// Stock validation utility
export const canAddToCart = (product, quantity = 1) => {
  const available = product?.stock ?? 0;

  if (available <= 0) {
    return {
      allowed: false,
      message: "This item is currently out of stock",
    };
  }

  if (quantity > available) {
    return {
      allowed: false,
      message: `Only ${available} item(s) available. You requested ${quantity}.`,
    };
  }

  return { allowed: true, message: "" };
};

export const isProductInStock = (product) => {
  const stock = product?.stock ?? 0;
  return stock > 0;
};

export const getAvailableStock = (product) => {
  return Math.max(0, product?.stock ?? 0);
};
