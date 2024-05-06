const joi = require('joi');

module.exports = {
  createProduct: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      category: joi.string().min(1).max(100).required().label('Category'),
      price: joi.number().positive().required().label('Price'),
      quantity: joi.number().integer().min(0).required().label('Quantity'),
    },
  },
  updateProduct: {
    body: {
      name: joi.string().min(1).max(100).optional().label('Name'),
      category: joi.string().min(1).max(100).optional().label('Category'),
      quantity: joi.number().integer().min(0).optional().label('Quantity'),
    },
  },
  changePrice: {
    body: {
      price: joi.number().positive().required().label('Price'),
    },
  },
};
