require('dotenv').config();
const mongoose = require('mongoose');
const ServiceProvider = require('./models/ServiceProvider');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';
const dummyData = [
  // Cleaning
  { name: 'Kylee Danford', category: 'Cleaning', title: 'House Cleaning', price: 2500, rating: 4.8, reviewsCount: 289, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=90&auto=format&fit=max' },
  { name: 'Freida Varns', category: 'Cleaning', title: 'Bathroom Cleaning', price: 2400, rating: 4.8, reviewsCount: 289, image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=1200&q=90&auto=format&fit=max' },

  // Repairing
  { name: 'Alfonzo Schulfz', category: 'Repairing', title: 'Car Repairing', price: 2500, rating: 4.8, reviewsCount: 289, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=90&auto=format&fit=max' },
  { name: 'Marcus Bellow', category: 'Repairing', title: 'Motorcycle Repairing', price: 2000, rating: 4.7, reviewsCount: 189, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=90&auto=format&fit=max' },

  // Painting
  { name: 'Sanjeenta', category: 'Painting', title: 'Wall Painting', price: 3000, rating: 4.8, reviewsCount: 210, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=90&auto=format&fit=max' },

  // Laundry
  { name: 'Rehan Malik', category: 'Laundry', title: 'Washing Clothes', price: 1200, rating: 4.6, reviewsCount: 150, image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&q=90&auto=format&fit=max' },

  // Appliance
  { name: 'Bilal Ahmed', category: 'Appliance', title: 'Fridge Repair', price: 1800, rating: 4.7, reviewsCount: 120, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=90&auto=format&fit=max' },

  // Plumbing
  { name: 'Hamza Tariq', category: 'Plumbing', title: 'Pipe Fitting', price: 1500, rating: 4.5, reviewsCount: 98, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&auto=format&fit=max' },

  // Shifting
  { name: 'Faizan Shifting Co.', category: 'Shifting', title: 'Home Shifting', price: 5000, rating: 4.9, reviewsCount: 340, image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=90&auto=format&fit=max' },

  // Beauty
  { name: 'Ayesha Salon', category: 'Beauty', title: 'Facial & Makeup', price: 2200, rating: 4.8, reviewsCount: 275, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=90&auto=format&fit=max' },

  // AC Repair
  { name: 'Cool Air Services', category: 'AC Repair', title: 'AC Servicing', price: 2600, rating: 4.7, reviewsCount: 198, image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1200&q=90&auto=format&fit=max' },

  // Vehicle
  { name: 'Speedy Auto Care', category: 'Vehicle', title: 'Car Wash & Detailing', price: 1800, rating: 4.6, reviewsCount: 167, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=90&auto=format&fit=max' },

  // Electronics
  { name: 'TechFix Center', category: 'Electronics', title: 'TV Repair', price: 2000, rating: 4.5, reviewsCount: 143, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=90&auto=format&fit=max' },

  // Massage
  { name: 'Relax Spa', category: 'Massage', title: 'Full Body Massage', price: 3200, rating: 4.9, reviewsCount: 310, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=90&auto=format&fit=max' },

  // Men's Salon
  { name: "Sultan's Barber Shop", category: "Men's Salon", title: 'Haircut & Beard', price: 800, rating: 4.7, reviewsCount: 205, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=90&auto=format&fit=max' },
];
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=800&q=85&auto=format',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=85&auto=format',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=85&auto=format',
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=85&auto=format',
];

const SAMPLE_REVIEWERS = [
  { userName: 'Lauralee', avatar: 'https://i.pravatar.cc/150?img=12' },
  { userName: 'Clinton', avatar: 'https://i.pravatar.cc/150?img=33' },
  { userName: 'Chieko', avatar: 'https://i.pravatar.cc/150?img=45' },
];

const SAMPLE_COMMENTS = [
  'Awesome! This is what I was looking for, I recommend to everyone.',
  'The workers are very professional and the results are very satisfying, I like it very much!',
  'This is the first time I used his services, and the results were amazing.',
];

const SAMPLE_LOCATION = '255 Grand Park Avenue, Lahore';

function randomRating() {
  const pool = [5, 5, 5, 4, 4, 3];
  return pool[Math.floor(Math.random() * pool.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
async function seedBaseProviders() {
  console.log('Ensuring base provider list exists...');
  let created = 0;

  for (const p of dummyData) {
    const result = await ServiceProvider.findOneAndUpdate(
      { name: p.name, title: p.title }, // match key 
      { $setOnInsert: p },
      { upsert: true, new: true, rawResult: true }
    );
    if (result.lastErrorObject && !result.lastErrorObject.updatedExisting) {
      created++;
    }
  }

  console.log(`Base provider check done. ${created} new provider(s) inserted (existing ones left as-is).`);
}
async function seedExtras() {
  const providers = await ServiceProvider.find({});
  console.log(`Found ${providers.length} provider(s) total.`);

  for (const provider of providers) {
    let changed = false;

    if (!provider.about) {
      provider.about =
        `Professional ${provider.category?.toLowerCase() || 'service'} expert with over 3+ years ` +
        `of experience in delivering high-quality, reliable results. Fully verified and background-checked.`;
      changed = true;
    }

    if (!provider.photos || provider.photos.length === 0) {
      provider.photos = SAMPLE_PHOTOS;
      changed = true;
    }

    if (!provider.location) {
      provider.location = SAMPLE_LOCATION;
      changed = true;
    }

    if (changed) {
      await provider.save();
      console.log(`Updated about/photos/location for: ${provider.name}`);
    }
    const existingCount = await Review.countDocuments({ provider: provider._id });
    if (existingCount === 0) {
      const reviewDocs = SAMPLE_REVIEWERS.map((reviewer, idx) => ({
        provider: provider._id,
        userName: reviewer.userName,
        avatar: reviewer.avatar,
        rating: randomRating(),
        comment: SAMPLE_COMMENTS[idx],
        likes: Math.floor(Math.random() * 900) + 50,
        createdAt: daysAgo((idx + 1) * 7),
      }));

      await Review.insertMany(reviewDocs);

      provider.reviewsCount = reviewDocs.length;
      provider.rating =
        Math.round(
          (reviewDocs.reduce((sum, r) => sum + r.rating, 0) / reviewDocs.length) * 10
        ) / 10;
      await provider.save();

      console.log(`Added ${reviewDocs.length} sample review(s) for: ${provider.name}`);
    }
  }
}
async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await seedBaseProviders();
    await seedExtras();

    console.log('Done seeding all data.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();