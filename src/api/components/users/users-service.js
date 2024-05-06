const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users with pagination and filtering
 * @param {number} page_number - Page number
 * @param {number} page_size - Number of users per page
 * @param {string} search - Search query in the format "fieldName:searchKey"
 * @param {string} sort - Sort order
 * @returns {Array}
 */
async function getUsers(
  page_number = 1,
  page_size = 10,
  search = '',
  sort = 'email:asc'
) {
  const query = {};
  if (search) {
    const [fieldName, searchKey] = search.split(':');
    if (['email', 'name'].includes(fieldName)) {
      query[fieldName] = { $regex: new RegExp(searchKey, 'i') }; // Case-insensitive regex search
    }
  }

  const sortOptions = {};
  if (sort) {
    const [sortField, sortOrder] = sort.split(':');
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
  }

  const totalUsers = await usersRepository.countUsers(query);
  const totalPages = Math.ceil(totalUsers / page_size);
  const hasPreviousPage = page_number > 1;
  const hasNextPage = page_number < totalPages;

  const users = await usersRepository.getUsers({
    query,
    options: {
      skip: (page_number - 1) * page_size,
      limit: page_size,
      sort: sortOptions,
    },
  });

  // Conditional natural sorting based on the absence of sort parameter
  if (!sort) {
    users.sort((a, b) => naturalSort(a.name, b.name));
  }

  const results = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  return {
    page_number,
    page_size,
    count: results.length,
    total_pages: totalPages,
    has_previous_page: hasPreviousPage,
    has_next_page: hasNextPage,
    data: results,
  };
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

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
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  naturalSort,
};
