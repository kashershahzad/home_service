import { addressApi, bookingApi, getToken } from "./api";
import {
  DEFAULT_CATALOG_COORDS,
  getCatalogCoords,
  mapUiRoomsToApi,
} from "./catalog";

const DEFAULT_ADDRESS_BODY = {
  label: "Home",
  line: "House # 123, Street 5, Block B",
  area: "Gulberg",
  city: "Lahore",
  lat: DEFAULT_CATALOG_COORDS.lat,
  lng: DEFAULT_CATALOG_COORDS.lng,
  isDefault: true,
};

/** Normalize quote payload from `/bookings/quote` (pricing | quote | root). */
export function parseQuotePricing(data) {
  const q = data?.pricing || data?.quote || data || {};
  const serviceAmount = Number(q.serviceAmount ?? q.service ?? 0);
  const addOnsAmount = Number(q.addOnsAmount ?? q.addonsAmount ?? 0);
  const serviceFeeAndTaxes = Number(
    q.serviceFeeAndTaxes ?? q.serviceFee ?? q.fees ?? 0,
  );
  const travelFee = Number(q.travelFee ?? 0);
  const discountAmount = Number(q.discountAmount ?? q.discount ?? 0);
  const total =
    q.total != null
      ? Number(q.total)
      : serviceAmount +
        addOnsAmount -
        discountAmount +
        serviceFeeAndTaxes +
        travelFee;

  return {
    serviceAmount,
    addOnsAmount,
    serviceFeeAndTaxes,
    travelFee,
    discountAmount,
    total,
    raw: q,
  };
}

export function parseAddOnIds(raw) {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function parseAddOns(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Prefer existing default address; otherwise create Postman sample Home. */
export async function ensureAddressId(fallbackAddress) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in to continue booking.");

  const listed = await addressApi.list(token).catch(() => null);
  const addresses =
    listed?.addresses || listed?.data || (Array.isArray(listed) ? listed : []);
  const preferred =
    addresses.find((a) => a.isDefault) ||
    addresses[0] ||
    null;
  if (preferred?._id || preferred?.id) {
    return {
      addressId: String(preferred._id || preferred.id),
      address: {
        label: preferred.label || "Home",
        line: preferred.line || preferred.addressLine || "",
        raw: preferred,
      },
    };
  }

  const coords = await getCatalogCoords();
  const body = {
    ...DEFAULT_ADDRESS_BODY,
    ...fallbackAddress,
    lat: coords.lat,
    lng: coords.lng,
  };
  const created = await addressApi.create(token, body);
  const address = created?.address || created;
  const addressId = address?._id || address?.id;
  if (!addressId) throw new Error("Could not save address for booking.");

  return {
    addressId: String(addressId),
    address: {
      label: address.label || body.label,
      line: address.line || body.line,
      raw: address,
    },
  };
}

export async function quoteHairDressing({ packageId, addOnIds }) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in to continue booking.");
  const { lat, lng } = await getCatalogCoords();
  const data = await bookingApi.quote(token, {
    categorySlug: "hair-dressing",
    packageId,
    addOnIds: addOnIds || [],
    lat,
    lng,
  });
  return { pricing: parseQuotePricing(data), lat, lng, raw: data };
}

export async function createHairDressingBooking({
  packageId,
  addOnIds,
  addressId,
  scheduleDate,
  scheduleSlot,
  markPaid = true,
}) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in to continue booking.");
  const { lat, lng } = await getCatalogCoords();
  const data = await bookingApi.create(token, {
    categorySlug: "hair-dressing",
    packageId,
    addOnIds: addOnIds || [],
    addressId,
    schedule: {
      date: scheduleDate,
      slot: scheduleSlot,
    },
    markPaid,
    lat,
    lng,
  });
  return { booking: data?.booking || data, raw: data };
}

/** Build Postman `propertyConfig` from PropertyDetails UI state. */
export function buildCleaningPropertyConfig(details = {}) {
  const propertyType = details.propertyId || details.propertyType || "flat";

  if (propertyType === "flat") {
    return {
      propertyType: "flat",
      bhk: details.bhk || "2bhk",
      rooms: mapUiRoomsToApi(details.roomCounts),
    };
  }

  if (propertyType === "house") {
    return {
      propertyType: "house",
      bhk: details.bhk || "custom",
      areaValue: Number(details.plotSize ?? details.areaValue ?? 10),
      areaUnit: details.plotUnit || details.areaUnit || "marla",
      stories: details.stories || "double",
      rooms: mapUiRoomsToApi(details.roomCounts),
    };
  }

  // office / room
  return {
    propertyType,
    areaValue: Number(details.areaSize ?? details.areaValue ?? 10),
    areaUnit: details.areaUnit || "marla",
    hasWashrooms:
      details.hasWashrooms === true ||
      details.hasWashrooms === "Yes" ||
      details.hasWashrooms === "yes",
    hasKitchen:
      details.hasKitchen === true ||
      details.hasKitchen === "Yes" ||
      details.hasKitchen === "yes",
  };
}

export async function quoteHomeCleaning({
  propertyDetails,
  addOnIds = [],
  promoCode,
}) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in to continue booking.");
  const { lat, lng } = await getCatalogCoords();
  const body = {
    categorySlug: "home-cleaning",
    propertyConfig: buildCleaningPropertyConfig(propertyDetails),
    addOnIds: addOnIds || [],
    lat,
    lng,
  };
  if (promoCode) body.promoCode = promoCode;
  const data = await bookingApi.quote(token, body);
  return { pricing: parseQuotePricing(data), lat, lng, raw: data };
}

export async function createHomeCleaningBooking({
  propertyDetails,
  addOnIds = [],
  addressId,
  scheduleDate,
  scheduleSlot,
  promoCode,
  markPaid = true,
}) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in to continue booking.");
  const { lat, lng } = await getCatalogCoords();
  const body = {
    categorySlug: "home-cleaning",
    propertyConfig: buildCleaningPropertyConfig(propertyDetails),
    addOnIds: addOnIds || [],
    addressId,
    schedule: {
      date: scheduleDate,
      slot: scheduleSlot,
    },
    markPaid,
    lat,
    lng,
  };
  if (promoCode) body.promoCode = promoCode;
  const data = await bookingApi.create(token, body);
  return { booking: data?.booking || data, raw: data };
}
