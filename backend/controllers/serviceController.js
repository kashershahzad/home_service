const ServiceProvider = require('../models/ServiceProvider');
const Review = require('../models/Review');

const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const providers = await ServiceProvider.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') },
    });
    res.status(200).json({ providers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};


const getPopular = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { rating: { $gte: 4.5 } }; 
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const providers = await ServiceProvider.find(filter)
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(10);

    res.status(200).json({ providers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch popular services', error: error.message });
  }
};


const getCategories = async (req, res) => {
  try {
    const categories = await ServiceProvider.distinct('category');
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const searchServices = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, rating } = req.query;

    const filter = {};

   
    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), 'i');
      filter.$or = [{ name: regex }, { title: regex }, { category: regex }];
    }

    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

  
    if (rating && rating !== 'All') {
      filter.rating = { $gte: Number(rating) };
    }

  
    if (Object.keys(filter).length === 0) {
      return res.status(200).json({ providers: [] });
    }

    const providers = await ServiceProvider.find(filter).sort({
      rating: -1,
      reviewsCount: -1,
    });

    res.status(200).json({ providers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search services', error: error.message });
  }
};
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await ServiceProvider.findById(id);
    if (!provider) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const reviews = await Review.find({ provider: id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ provider, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch service detail', error: error.message });
  }
};

module.exports = { getByCategory, getPopular, getCategories, searchServices,getServiceById, };

