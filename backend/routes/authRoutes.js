const express = require('express');
const router = express.Router();
const {
  signup,
  completeProfile,
  setPin,
  enableBiometric,
  login,
  getMe,
} = require('../controllers/authController');
const { protect, requireFullAccess } = require('../middleware/auth');
router.post('/signup', signup);
router.put('/profile', protect, completeProfile);  
router.put('/set-pin', protect, setPin);            


router.put('/enable-biometric', protect, requireFullAccess, enableBiometric);
router.post('/login', login);
router.get('/me', protect, getMe); 

module.exports = router;