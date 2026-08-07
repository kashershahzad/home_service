const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: { type: String, trim: true },
    nickname: { type: String, trim: true },
    dob: { type: Date },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    profileImageUrl: { type: String, default: null },


    pinHash: { type: String, select: false },

    biometricEnabled: { type: Boolean, default: false },

   
    profileCompleted: { type: Boolean, default: false },
    pinSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('pinHash') || !this.pinHash) return next();
  const salt = await bcrypt.genSalt(10);
  this.pinHash = await bcrypt.hash(this.pinHash, salt);
  next();
});

userSchema.methods.comparePin = async function (candidatePin) {
  if (!this.pinHash) return false;
  return bcrypt.compare(candidatePin, this.pinHash);
};

module.exports = mongoose.model('User', userSchema);