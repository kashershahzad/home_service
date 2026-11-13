/**
 * Map a home/catalog/popular service item to the booking flow route.
 * Service detail is intentionally skipped — go straight to booking.
 */
export function getBookingRoute(item = {}) {
  const slug = String(
    item?.slug ||
      item?.categorySlug ||
      item?.id ||
      item?.category ||
      item?.label ||
      item?.title ||
      item?.name ||
      "",
  ).toLowerCase();
  const flow = String(item?.bookingFlow || "").toLowerCase();
  const blob = `${slug} ${flow} ${item?.title || ""} ${item?.name || ""}`.toLowerCase();

  if (
    flow === "hair" ||
    slug === "hair-dressing" ||
    blob.includes("hair") ||
    blob.includes("salon") ||
    blob.includes("dress") ||
    blob.includes("beauty") ||
    blob.includes("makeup")
  ) {
    return {
      pathname: "/booking/bookHaircutService",
      params: {
        categorySlug: slug.includes("hair") ? "hair-dressing" : slug || "hair-dressing",
        id: String(item?.id || item?._id || ""),
        title: item?.title || item?.label || item?.name || "",
        name: item?.name || item?.title || item?.label || "",
      },
    };
  }

  return {
    pathname: "/booking/propertyBooking",
    params: {
      categorySlug: slug || "home-cleaning",
      id: String(item?.id || item?._id || ""),
      title: item?.title || item?.label || item?.name || "",
      name: item?.name || item?.title || item?.label || "",
    },
  };
}
