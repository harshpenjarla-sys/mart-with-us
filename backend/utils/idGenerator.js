function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `MWU-${year}${month}${day}-${randomSuffix}`;
}

module.exports = { generateOrderId };
