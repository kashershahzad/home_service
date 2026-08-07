const express = require('express');
const router = express.Router();
const {
  getByCategory,
  getPopular,
  getCategories,
  searchServices,
  getServiceById,
} = require('../controllers/serviceController');

router.get('/popular', getPopular);
router.get('/categories', getCategories);
router.get('/search', searchServices);
router.get('/category/:category', getByCategory);
router.get('/:id', getServiceById); // must stay LAST — catches any remaining id

module.exports = router;