import { images } from "../../../../assets/images/image";

export const BOOKING_TYPES = {
  HOUSE_CLEANING: "houseCleaning",
  HAIR_DRYER: "hairDryer",
};

export const FLOW_STEPS = {
  MATCHING: "matching",
  ASSIGNED: "assigned",
  ON_THE_WAY: "onTheWay",
};

export const FLOW_ORDER = [
  FLOW_STEPS.MATCHING,
  FLOW_STEPS.ASSIGNED,
  FLOW_STEPS.ON_THE_WAY,
];

const CLEANER = {
  name: "Sarah Ahmed",
  badge: "Top Pro",
  rating: "4.9",
  vehicle: "Electric Scooter (Green Fleet)",
  avatar: images.homecard1,
};

export const SERVICE_CONFIGS = {
  [BOOKING_TYPES.HOUSE_CLEANING]: {
    type: BOOKING_TYPES.HOUSE_CLEANING,
    serviceTitle: "Deep Home Cleaning",
    serviceIcon: images.brushIcon,
    price: "$85.00",
    chatLabel: "Chat with your cleaner",
    provider: CLEANER,
    steps: {
      [FLOW_STEPS.MATCHING]: {
        badge: "Assigning Cleaner",
        title: "Matching...",
        subtitle: "We're finding your cleaner",
        note: "Vetting nearest certified pro",
        progress: 0.55,
        showSparkles: true,
        bottom: "details",
        mapMode: FLOW_STEPS.MATCHING,
      },
      [FLOW_STEPS.ASSIGNED]: {
        badge: "Confirmed & Dispatched",
        title: "Cleaner Assigned",
        subtitle: "Your cleaning professional is confirmed!",
        note: null,
        progress: 0.75,
        showSparkles: true,
        bottom: "profile",
        mapMode: FLOW_STEPS.ASSIGNED,
      },
      [FLOW_STEPS.ON_THE_WAY]: {
        badge: null,
        eta: "15 — 25 mins",
        title: "Cleaner On The Way",
        subtitle:
          "Sarah is heading to your home with eco-certified cleaning supplies.",
        note: "Est. Arrival 9:15 AM",
        progress: 0.9,
        showSparkles: false,
        bottom: "profile",
        mapMode: FLOW_STEPS.ON_THE_WAY,
      },
    },
  },
  [BOOKING_TYPES.HAIR_DRYER]: {
    type: BOOKING_TYPES.HAIR_DRYER,
    serviceTitle: "Signature Styling",
    serviceIcon: images.scissors,
    price: "$85.00",
    chatLabel: "Chat with your Stylish",
    provider: CLEANER,
    steps: {
      [FLOW_STEPS.MATCHING]: {
        badge: "Assigning Hair styler",
        title: "Matching...",
        subtitle: "We're finding your Hair Stylist",
        note: "Vetting nearest certified pro",
        progress: 0.55,
        showSparkles: true,
        bottom: "details",
        mapMode: FLOW_STEPS.MATCHING,
      },
      [FLOW_STEPS.ASSIGNED]: {
        badge: "Confirmed & Dispatched",
        title: "Stylish Assigned",
        subtitle: "Your stylist is confirmed!",
        note: null,
        progress: 0.75,
        showSparkles: true,
        bottom: "profile",
        mapMode: FLOW_STEPS.ASSIGNED,
      },
      [FLOW_STEPS.ON_THE_WAY]: {
        badge: null,
        eta: "15 — 25 mins",
        title: "Stylish On The Way",
        subtitle:
          "Sarah is heading to your home with styling tools ready.",
        note: "Est. Arrival 9:15 AM",
        progress: 0.9,
        showSparkles: false,
        bottom: "profile",
        mapMode: FLOW_STEPS.ON_THE_WAY,
      },
    },
  },
};
