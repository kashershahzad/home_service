import * as Location from "expo-location";
import { images } from "../assets/images/image";
import { catalogApi } from "./api";

/** Postman sample — Lahore Area 1 */
export const DEFAULT_CATALOG_COORDS = { lat: 31.52, lng: 74.35 };

const ADDON_ICONS = {
  windows: images.windows,
  "inside-oven": images.insideOven,
  oven: images.insideOven,
  "inside-fridge": images.insideFridge,
  fridge: images.insideFridge,
  cabinets: images.cabinets,
  balcony: images.balconies,
  balconies: images.balconies,
  laundry: images.bookingLaundry,
  "beard-dye": images.hair,
  "hair-wash": images.hair,
  "head-massage": images.massageIcon,
  "kids-addon": images.family,
};

const SLOT_ICONS = {
  morning: images.morning,
  afternoon: images.afternoon,
  evening: images.evening,
};

export async function getCatalogCoords() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return DEFAULT_CATALOG_COORDS;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return DEFAULT_CATALOG_COORDS;
  }
}

export async function fetchCatalogCategory(slug, audience) {
  const { lat, lng } = await getCatalogCoords();
  const data = await catalogApi.getCategory(slug, lat, lng, audience);
  return {
    lat,
    lng,
    category: data?.category || data,
    raw: data,
  };
}

export function mapCatalogAddOns(addOns = []) {
  return addOns.map((item, index) => {
    const slug = item.slug || item.id || `addon-${index}`;
    const title = item.name || item.title || slug;
    return {
      id: String(item.id || slug),
      slug: String(slug),
      title: String(title),
      shortTitle: String(item.shortTitle || title),
      price: Number(item.price ?? item.amount ?? 0),
      icon: ADDON_ICONS[slug] || images.moreIcon,
      raw: item,
    };
  });
}

export function mapCatalogPackages(packages = []) {
  return packages.map((item, index) => {
    const id = String(item.id || item.slug || `pkg-${index}`);
    const title = item.name || item.title || "Package";
    const priceNum = Number(item.price ?? item.amount ?? 0);
    const durationMins = item.durationMinutes ?? item.duration ?? null;
    const duration =
      typeof item.duration === "string" && item.duration.includes("min")
        ? item.duration
        : durationMins != null
          ? `${durationMins} mins`
          : item.durationLabel || "";

    const nameLower = String(title).toLowerCase();
    return {
      id,
      title: String(title),
      description:
        item.description ||
        (Array.isArray(item.includes) ? item.includes.join(", ") : "") ||
        "",
      price: priceNum ? priceNum.toLocaleString("en-PK") : "0",
      priceRaw: priceNum,
      duration,
      recommended: !!(item.recommended || nameLower.includes("grooming")),
      special: !!(item.special || nameLower.includes("dulha") || nameLower === "groom"),
      gentleCare: !!(item.gentleCare || nameLower.includes("aqiqah") || nameLower.includes("newborn")),
      raw: item,
    };
  });
}

export function mapCatalogTimeSlots(timeSlots = []) {
  return timeSlots.map((item, index) => {
    const id = String(item.id || item.slug || item.key || `slot-${index}`);
    const title =
      item.title ||
      item.name ||
      item.label ||
      id.charAt(0).toUpperCase() + id.slice(1);
    const start = item.startTime || item.start || "";
    const end = item.endTime || item.end || "";
    const range =
      item.range ||
      item.timeRange ||
      (start && end ? `${start} – ${end}` : "") ||
      (typeof item.display === "string" && item.display.includes("–")
        ? item.display.split(":").slice(1).join(":").trim()
        : "") ||
      "";
    const displayTime =
      item.displayTime ||
      start ||
      range.split("–")[0]?.trim() ||
      title;

    return {
      id: id.toLowerCase(),
      title: String(title),
      range: String(range),
      displayTime: String(displayTime),
      icon: SLOT_ICONS[id.toLowerCase()] || images.time2,
      raw: item,
    };
  });
}

const PROPERTY_ICONS = {
  flat: images.flat,
  house: images.house,
  office: images.office,
  room: images.room,
};

const ROOM_UI_KEYS = {
  living: "livingRoom",
  livingRoom: "livingRoom",
  bedrooms: "bedrooms",
  washrooms: "washrooms",
  kitchen: "kitchen",
  balcony: "terrace",
  terrace: "terrace",
  garage: "garage",
};

const ROOM_ICONS = {
  livingRoom: images.livingRoom,
  bedrooms: images.bedroom,
  washrooms: images.washroom,
  kitchen: images.kitchen,
  terrace: images.terrace,
  garage: images.garage,
};

/** API rooms → UI roomCounts keys used by Flat/House screens. */
export function mapApiRoomsToUi(rooms = {}) {
  const out = {};
  Object.entries(rooms || {}).forEach(([key, value]) => {
    const uiKey = ROOM_UI_KEYS[key] || key;
    out[uiKey] = Number(value) || 0;
  });
  return out;
}

/** UI roomCounts → API propertyConfig.rooms */
export function mapUiRoomsToApi(roomCounts = {}) {
  return {
    living: Number(roomCounts.livingRoom ?? roomCounts.living ?? 0),
    bedrooms: Number(roomCounts.bedrooms ?? 0),
    washrooms: Number(roomCounts.washrooms ?? 0),
    kitchen: Number(roomCounts.kitchen ?? 0),
    balcony: Number(roomCounts.terrace ?? roomCounts.balcony ?? 0),
    garage: Number(roomCounts.garage ?? 0),
  };
}

export function mapCleaningPropertyTypes(propertyTypes = []) {
  return propertyTypes.map((item, index) => {
    const id = String(item.key || item.id || item.slug || `type-${index}`);
    return {
      id,
      title: String(item.label || item.name || item.title || id),
      description: String(item.description || ""),
      icon: PROPERTY_ICONS[id] || images.bookingHome,
      raw: item,
    };
  });
}

export function mapCleaningBhkOptions(bhkOptions = []) {
  return bhkOptions
    .filter((item) => {
      const key = String(item.key || item.id || "").toLowerCase();
      return key && key !== "custom";
    })
    .map((item, index) => {
      const id = String(item.key || item.id || `bhk-${index}`);
      return {
        id,
        label: String(item.label || item.name || id.toUpperCase()),
        raw: item,
      };
    });
}

export function mapCleaningRoomFields(roomFields = [], { includeGarage = true } = {}) {
  return roomFields
    .map((item, index) => {
      const apiKey = String(item.key || item.id || `room-${index}`);
      const id = ROOM_UI_KEYS[apiKey] || apiKey;
      if (!includeGarage && id === "garage") return null;
      return {
        id,
        apiKey,
        title: String(item.label || item.name || id),
        description: String(item.description || ""),
        icon: ROOM_ICONS[id] || images.moreIcon,
        raw: item,
      };
    })
    .filter(Boolean);
}

export function mapCleaningStories(stories = []) {
  const icons = {
    single: images.storySingle,
    double: images.storyDouble,
    basement: images.storyBasement,
  };
  return stories.map((item, index) => {
    const id = String(item.key || item.id || `story-${index}`);
    return {
      id,
      title: String(item.label || item.name || id),
      icon: icons[id] || images.storySingle,
      raw: item,
    };
  });
}

export function buildBhkDefaultsFromRateHints(rateHints) {
  const bases = rateHints?.flatBhkBases || [];
  const defaults = {};
  bases.forEach((item) => {
    const id = String(item.key || "");
    if (!id) return;
    defaults[id] = mapApiRoomsToUi(item.includedRooms || {});
  });
  return defaults;
}

export async function fetchCleaningCatalog() {
  const result = await fetchCatalogCategory("home-cleaning");
  const category = result.category || {};
  const propertyTypes = mapCleaningPropertyTypes(category.propertyTypes || []);
  const bhkOptions = mapCleaningBhkOptions(category.bhkOptions || []);
  const roomFields = mapCleaningRoomFields(category.roomFields || []);
  const flatRooms = mapCleaningRoomFields(category.roomFields || [], {
    includeGarage: false,
  });
  const stories = mapCleaningStories(category.stories || []);
  const bhkDefaults = buildBhkDefaultsFromRateHints(category.rateHints);
  const addOns = mapCatalogAddOns(category.addOns || []);
  const timeSlots = mapCatalogTimeSlots(category.timeSlots || []);

  return {
    ...result,
    category,
    propertyTypes,
    bhkOptions,
    roomFields,
    flatRooms,
    stories,
    bhkDefaults,
    addOns,
    timeSlots,
    areaUnits: category.areaUnits || {},
    rateHints: category.rateHints || {},
  };
}
