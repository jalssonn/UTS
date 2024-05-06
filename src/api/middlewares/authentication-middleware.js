const passport = require('passport');
const passportJWT = require('passport-jwt');

const config = require('../../core/config');
const { User, Product } = require('../../models');

// General strategy for both user and product
passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: config.secret.jwt,
    },
    async (payload, done) => {
      try {
        const user = await User.findOne({ id: payload.user_id });
        if (!user) return done(null, false);

        // Optionally check if the user has access to products
        if (payload.access && payload.access.includes('products')) {
          const product = await Product.findOne({ id: payload.product_id });
          if (!product) return done(null, false);
        }

        return done(null, user); // User is authenticated and optionally checked for product access
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = {
  authenticate: passport.authenticate('jwt', { session: false }),
};
