const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    image: { type: String, default: null },
    about: { type: String, default: '' },          
    photos: { type: [String], default: [] },       
    videos: { type: [String], default: [] },      
    location: { type: String, default: '' },       
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);