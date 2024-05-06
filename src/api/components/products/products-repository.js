const { Product } = require('../../../models');

/**
 * Get a list of products
 * @returns {Promise}
 */
async function getProducts({ query = {}, options = {} }) {
  return Product.find(query)
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit);
}

/**
 * Get product detail
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function getProduct(id) {
  return Product.findById(id);
}

/**
 * Create new product
 * @param {string} name - Name
 * @param {string} category - Category
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {Promise}
 */
async function createProduct(name, category, price, quantity) {
  return Product.create({
    name,
    category,
    price,
    quantity,
  });
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} name - Name
 * @param {string} category - Category
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {Promise}
 */
async function updateProduct(id, name, category, price, quantity) {
  return Product.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        category,
        price,
        quantity,
      },
    }
  );
}
/**
 * Change product price
 * @param {string} id - Product ID
 * @param {string} price - New Price
 * @returns {Promise}
 */
async function changePrice(id, price) {
  return Product.updateOne(
    { _id: id },
    {
      $set: {
        price,
      },
    }
  );
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function deleteProduct(id) {
  return Product.deleteOne({ _id: id });
}

async function countProducts(query = {}) {
  return Product.countDocuments(query);
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  countProducts,
  changePrice,
};
