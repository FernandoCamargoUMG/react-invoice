// Helpers para manejar items y precios desde la ficha de producto
export const getProductPrice = (product) => {
    if (!product) return 0;
    return Number(product.price ?? product.unit_price ?? product.sale_price ?? 0);
};

export const applyProductDefaultsToItem = (existingItem = {}, product = {}, priceKey = 'price', totalKey = 'total_price', quantityKey = 'quantity') => {
    const price = getProductPrice(product);
    const quantity = existingItem[quantityKey] || 0;
    const newItem = { ...existingItem, product_id: product?.id ?? existingItem.product_id, [priceKey]: price };
    newItem[totalKey] = parseFloat(quantity) * parseFloat(price);
    return newItem;
};

export const recalcItemTotal = (item = {}, priceKey = 'price', quantityKey = 'quantity', totalKey = 'total_price') => {
    const quantity = parseFloat(item[quantityKey] || 0);
    const price = parseFloat(item[priceKey] || 0);
    return { ...item, [totalKey]: quantity * price };
};

export default {
    getProductPrice,
    applyProductDefaultsToItem,
    recalcItemTotal
};
