import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import MatchingStatus from "./booking/propertyBooking/confirmedBooking/MatchingStatus";
import {
  BOOKING_TYPES,
} from "./booking/propertyBooking/confirmedBooking/serviceConfigs";

function resolveBookingType(slug, title) {
  const key = `${slug || ""} ${title || ""}`.toLowerCase();
  if (
    key.includes("hair") ||
    key.includes("salon") ||
    key.includes("dress") ||
    key.includes("beauty")
  ) {
    return BOOKING_TYPES.HAIR_DRYER;
  }
  return BOOKING_TYPES.HOUSE_CLEANING;
}

function formatPrice(value) {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export default function BookingTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingApiId = String(
    params.bookingApiId || params.bookingId || "",
  ).replace(/^#/, "");
  const bookingId = String(
    params.reference || params.bookingId || bookingApiId || "",
  ).replace(/^#/, "");

  const schedule = useMemo(
    () => ({
      displayTime: params.appointment || params.scheduleTime || "",
      address: {
        line: params.addressLine || "",
      },
    }),
    [params.appointment, params.scheduleTime, params.addressLine],
  );

  const bookingType = resolveBookingType(
    params.categorySlug,
    params.serviceTitle || params.title,
  );

  return (
    <MatchingStatus
      bookingType={bookingType}
      bookingId={bookingId || bookingApiId}
      bookingApiId={bookingApiId || bookingId}
      schedule={schedule}
      serviceTitle={params.serviceTitle || params.title || undefined}
      priceLabel={formatPrice(params.total)}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/home");
      }}
    />
  );
}
