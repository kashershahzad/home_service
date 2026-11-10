import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import MatchingStatus from "../propertyBooking/confirmedBooking/MatchingStatus";
import { BOOKING_TYPES } from "../propertyBooking/confirmedBooking/serviceConfigs";

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export default function HaircutConfirmedBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const schedule = useMemo(
    () => ({
      displayTime: params.scheduleTime || "",
      address: {
        line: params.addressLine || "",
      },
    }),
    [params.scheduleTime, params.addressLine],
  );

  return (
    <MatchingStatus
      bookingType={BOOKING_TYPES.HAIR_DRYER}
      bookingId={String(params.bookingId || "HS-0000")}
      schedule={schedule}
      serviceTitle={params.packageTitle || "Hair Dressing"}
      priceLabel={formatPrice(params.total)}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/home");
      }}
    />
  );
}
