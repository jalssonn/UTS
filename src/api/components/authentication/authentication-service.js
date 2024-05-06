const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check email and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);
  if (!user) return null;

  if (user.lockUntil && user.lockUntil > Date.now()) {
    const error = new Error(
      'Forbidden: Too many failed login attempts. Please try again later.'
    );
    error.status = 403;
    throw error;
  }

  const isPasswordCorrect = await passwordMatched(password, user.password);
  if (isPasswordCorrect) {
    await authenticationRepository.resetLoginAttempts(email);
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  } else {
    await authenticationRepository.incrementLoginAttempts(user);
    return null;
  }
}

module.exports = {
  checkLoginCredentials,
};
