const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function incrementLoginAttempts(user) {
  // If lock time has passed, reset login attempts
  if (user.lockUntil && user.lockUntil < Date.now()) {
    return user.updateOne({
      $set: { loginAttempts: 1, lockUntil: null },
    });
  }
  // If reaching the limit, set lock time 30 minutes from now
  if (user.loginAttempts + 1 >= 5) {
    return user.updateOne({
      $inc: { loginAttempts: 1 },
      $set: { lockUntil: Date.now() + 30 * 60 * 1000 },
    });
  } else {
    return user.updateOne({ $inc: { loginAttempts: 1 } });
  }
}

async function resetLoginAttempts(email) {
  return User.updateOne(
    { email },
    {
      $set: { loginAttempts: 0, lockUntil: null },
    }
  );
}

module.exports = {
  getUserByEmail,
  incrementLoginAttempts,
  resetLoginAttempts,
};
