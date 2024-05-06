const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const productsControllers = require('./products-controller');
const productsValidator = require('./products-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/products', route);

  // Get list of products
  route.get(
    '/',
    authenticationMiddleware.authenticate,
    productsControllers.getProducts
  );
  // Create product
  route.post(
    '/',
    authenticationMiddleware.authenticate,
    celebrate(productsValidator.createProduct),
    productsControllers.createProduct
  );

  // Get product detail
  route.get(
    '/:id',
    authenticationMiddleware.authenticate,
    productsControllers.getProduct
  );

  // Update product
  route.put(
    '/:id',
    authenticationMiddleware.authenticate,
    celebrate(productsValidator.updateProduct),
    productsControllers.updateProduct
  );

  // Delete product
  route.delete(
    '/:id',
    authenticationMiddleware.authenticate,
    productsControllers.deleteProduct
  );

  // Change product price
  route.post(
    '/:id/change-price',
    authenticationMiddleware.authenticate,
    celebrate(productsValidator.changePrice),
    productsControllers.changePrice
  );
};
