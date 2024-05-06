const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const productsSchema = require('./products-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

// Gunakan skema yang sudah diimpor langsung untuk membuat model
const User = mongoose.model('User', usersSchema);
const Product = mongoose.model('Product', productsSchema);

module.exports = {
  mongoose,
  User,
  Product,
};
