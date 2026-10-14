import { images } from "../../../../assets/images/image";

export const PROPERTY_TABS = [
  { id: "flat", label: "Flat" },
  { id: "house", label: "House" },
  { id: "office", label: "Office" },
  { id: "room", label: "Room" },
];

export const BHK_OPTIONS = [
  { id: "studio", label: "Studio" },
  { id: "1bhk", label: "1 BHK" },
  { id: "2bhk", label: "2 BHK" },
  { id: "3bhk", label: "3 BHK" },
  { id: "4bhk", label: "4 BHK" },
];

export const BHK_DEFAULTS = {
  studio: {
    livingRoom: 1,
    bedrooms: 0,
    washrooms: 1,
    kitchen: 1,
    terrace: 0,
    garage: 0,
  },
  "1bhk": {
    livingRoom: 1,
    bedrooms: 1,
    washrooms: 1,
    kitchen: 1,
    terrace: 0,
    garage: 0,
  },
  "2bhk": {
    livingRoom: 1,
    bedrooms: 2,
    washrooms: 2,
    kitchen: 1,
    terrace: 1,
    garage: 0,
  },
  "3bhk": {
    livingRoom: 1,
    bedrooms: 3,
    washrooms: 2,
    kitchen: 1,
    terrace: 1,
    garage: 1,
  },
  "4bhk": {
    livingRoom: 1,
    bedrooms: 4,
    washrooms: 3,
    kitchen: 1,
    terrace: 1,
    garage: 1,
  },
};

export const FLAT_ROOMS = [
  {
    id: "livingRoom",
    title: "Living room",
    description: "Hall & seating zone.",
    icon: images.livingRoom,
  },
  {
    id: "bedrooms",
    title: "Bedrooms",
    description: "Master & guest rooms.",
    icon: images.bedroom,
  },
  {
    id: "washrooms",
    title: "Washrooms",
    description: "Attached & common baths.",
    icon: images.washroom,
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Cooking & utility area.",
    icon: images.kitchen,
  },
  {
    id: "terrace",
    title: "Terrace",
    description: "Outdoor sit-out spaces.",
    icon: images.terrace,
  },
];

export const HOUSE_ROOMS = [
  ...FLAT_ROOMS,
  {
    id: "garage",
    title: "Garage",
    description: "Parking & storage.",
    icon: images.garage,
  },
];

export const STORIES = [
  { id: "single", title: "Single", icon: images.storySingle },
  { id: "double", title: "Double", icon: images.storyDouble },
  { id: "basement", title: "Basement", icon: images.storyBasement },
];

export const MARLA_CHIPS = ["5", "7", "10", "20"];
export const KANAL_CHIPS = ["1", "2", "3", "4"];
export const SQFT_CHIPS = ["500", "1000", "1500", "2000"];
export const AREA_MARLA_CHIPS = ["5", "7", "10", "20"];

export const PROPERTY_TITLES = {
  flat: "Flat Details",
  house: "House Details",
  office: "Office Details",
  room: "Room Details",
};

export const PROPERTY_SUBTITLES = {
  flat: "Customize the size and layout of your flat.",
  house: "Customize the size and layout of your house.",
  office: "Customize the size and layout of your office.",
  room: "Customize the size and layout of your room.",
};
