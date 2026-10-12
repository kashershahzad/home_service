import { images } from "../assets/images/image";

export const POPULAR_SERVICES = [
  {
    id: "1",
    _id: "1",
    image: images.homecard1,
    rating: 4.9,
    reviewsCount: 128,
    tag: "Trending",
    tagColor: "trending",
    title: "Hair Dressing",
    subtitle: "Styling & Cut at home",
    price: "1500",
    name: "Ayesha Khan",
    category: "Hair & Salon",
    location: "DHA Phase 5, Lahore",
    about:
      "Professional at-home hair styling and cutting with premium products. Includes wash, cut, blow-dry, and finish. Perfect for busy schedules without leaving home.",
    photos: [images.homecard1, images.landing2],
  },
  {
    id: "2",
    _id: "2",
    image: images.homecard2,
    rating: 4.8,
    reviewsCount: 210,
    tag: "Popular",
    tagColor: "popular",
    title: "Home Cleaning",
    subtitle: "Deep sanitizing & sweep",
    price: "2000",
    name: "CleanPro Team",
    category: "Cleaning",
    location: "Lahore & Nearby Areas",
    about:
      "Deep home sanitization with HEPA vacuuming, microfiber wipe-downs, and anti-allergen fogging. Ideal for kitchens, living spaces, and high-touch surfaces.",
    photos: [images.homecard2, images.landing1],
  },
  {
    id: "3",
    _id: "3",
    image: images.homecard3,
    rating: 5.0,
    reviewsCount: 96,
    tag: "Top Rated",
    tagColor: "topRated",
    title: "Makeup & Beauty",
    subtitle: "Party & Bridal experts",
    price: "2500",
    name: "Glow Studio",
    category: "Beauty",
    location: "Model Town, Lahore",
    about:
      "Party and bridal makeup by certified artists. Includes skin prep, contour, eye look, and long-wear finish tailored to your event.",
    photos: [images.homecard3, images.landing2],
  },
  {
    id: "4",
    _id: "4",
    image: images.homecard4,
    rating: 4.9,
    reviewsCount: 175,
    tag: "Express",
    tagColor: "express",
    title: "Laundry & Ironing",
    subtitle: "Wash, fold & crisp press",
    price: "1200",
    name: "Press & Fold",
    category: "Laundry",
    location: "Gulberg, Lahore",
    about:
      "Express laundry with careful fabric care, enzyme wash for delicates, and crisp ironing. Pickup and drop available in selected zones.",
    photos: [images.homecard4, images.landing3],
  },
];

export const getPopularServiceById = (id) =>
  POPULAR_SERVICES.find((item) => String(item.id) === String(id));
