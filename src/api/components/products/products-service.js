const productsRepository = require('./products-repository');

/**
 * Get list of products with pagination and filtering
 * @param {number} page_number - Page number
 * @param {number} page_size - Number of products per page
 * @param {string} search - Search query in the format "fieldName:searchKey"
 * @param {string} sort - Sort order
 * @returns {Array}
 */
async function getProducts(
  page_number = 1,
  page_size = 10,
  search = '',
  sort = 'name:asc'
) {
  const query = {};
  if (search) {
    const [fieldName, searchKey] = search.split(':');
    if (['name', 'category'].includes(fieldName)) {
      query[fieldName] = { $regex: new RegExp(searchKey, 'i') }; // Case-insensitive regex search
    }
  }

  const sortOptions = {};
  if (sort) {
    const [sortField, sortOrder] = sort.split(':');
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
  }

  const totalProducts = await productsRepository.countProducts(query);
  const totalPages = Math.ceil(totalProducts / page_size);
  const hasPreviousPage = page_number > 1;
  const hasNextPage = page_number < totalPages;

  const products = await productsRepository.getProducts({
    query,
    options: {
      skip: (page_number - 1) * page_size,
      limit: page_size,
      sort: sortOptions,
    },
  });

  // Conditional natural sorting based on the absence of sort parameter
  if (!sort) {
    products.sort((a, b) => naturalSort(a.name, b.name));
  }

  const results = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: product.quantity,
  }));

  return {
    results,
  };
}

/**
 * Get product detail
 * @param {string} id - Product ID
 * @returns {Object}
 */
async function getProduct(id) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
  };
}

/**
 * Create new product
 * @param {string} name - Name
 * @param {string} category - Category
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {boolean}
 */
async function createProduct(name, category, price, quantity) {
  try {
    await productsRepository.createProduct(name, category, price, quantity);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} name - Name
 * @param {string} category - Category
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {boolean}
 */
async function updateProduct(id, name, category, price, quantity) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  try {
    await productsRepository.updateProduct(id, name, category, price, quantity);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {boolean}
 */
async function deleteProduct(id) {
  const product = await productsRepository.getProduct(id);

  // Product not found
  if (!product) {
    return null;
  }

  try {
    await productsRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the category is registered
 * @param {string} category - Category
 * @returns {boolean}
 */
async function categoryIsRegistered(category) {
  const product = await productsRepository.getProductByCategory(category);

  if (product) {
    return true;
  }

  return false;
}

/**
 * Change product price
 * @param {string} productId - Product ID
 * @param {string} price - Price
 * @returns {boolean}
 */
async function changePrice(productId, price) {
  const product = await productsRepository.getProduct(productId);

  // Check if product not found
  if (!product) {
    return null;
  }

  const changeSuccess = await productsRepository.changePrice(productId, price);

  if (!changeSuccess) {
    return null;
  }

  return true;
}

async function naturalSort(a, b) {
  const ax = [],
    bx = [];

  a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
    ax.push([$1 || Infinity, $2 || '']);
  });
  b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
    bx.push([$1 || Infinity, $2 || '']);
  });

  while (ax.length && bx.length) {
    const an = ax.shift();
    const bn = bx.shift();
    const nn = an[0] - bn[0] || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  categoryIsRegistered,
  changePrice,
  naturalSort,
};
