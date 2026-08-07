const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTempToken, generateAuthToken } = require('../utils/generateToken');

const signup = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }
    const token =
      user.profileCompleted && user.pinSet
        ? generateAuthToken(user._id)
        : generateTempToken(user._id);

    res.status(200).json({
      message: 'Signup successful',
      token,
      profileCompleted: user.profileCompleted,
      pinSet: user.pinSet,
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { fullName, nickname, dob, email, address, profileImageUrl } = req.body;
    console.log(' Received body:', req.body);  

    const user = req.user;
    if (fullName !== undefined) user.fullName = fullName;
    if (nickname !== undefined) user.nickname = nickname;
    if (dob !== undefined) user.dob = dob;
    if (email !== undefined) user.email = email;
    if (address !== undefined) user.address = address;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    user.profileCompleted = true;
    await user.save();
    console.log(' Saved user:', user.fullName, user.nickname);
    res.status(200).json({ message: 'Profile saved', user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save profile', error: error.message });
  }
};

const setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const user = req.user;
    user.pinHash = pin; 
    user.pinSet = true;
    await user.save();

    const token = generateAuthToken(user._id);

    res.status(200).json({ message: 'PIN set successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set PIN', error: error.message });
  }
};
const enableBiometric = async (req, res) => {
  try {
    const { enabled } = req.body;
    req.user.biometricEnabled = !!enabled;
    await req.user.save();

    res.status(200).json({
      message: enabled ? 'Biometric login enabled' : 'Biometric login disabled',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update biometric setting', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ message: 'Phone and PIN are required' });
    }

    const user = await User.findOne({ phone }).select('+pinHash');
    if (!user || !user.pinSet) {
      return res.status(404).json({ message: 'No account found, please sign up' });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect PIN' });
    }

    const token = generateAuthToken(user._id);
    res.status(200).json({ message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
const getMe = async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) });
};

function sanitizeUser(user) {
  return {
    id: user._id,
    phone: user.phone,
    fullName: user.fullName,
    nickname: user.nickname,
    dob: user.dob,
    email: user.email,
    address: user.address,
    profileImageUrl: user.profileImageUrl,
    biometricEnabled: user.biometricEnabled,
    profileCompleted: user.profileCompleted,
    pinSet: user.pinSet,
  };
}

module.exports = {
  signup,
  completeProfile,
  setPin,
  enableBiometric,
  login,
  getMe,
};