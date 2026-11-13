import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../assets/fonts/fonts";
import {
  createHomeCleaningBooking,
  quoteHomeCleaning,
} from "../../../utils/booking";
import ReviewBooking from "./ReviewBooking";

const ACCENT = "#0E6E4C";

export default function CleaningReview({
  propertyDetails,
  extrasData,
  schedule,
  onBack,
  onEditSchedule,
  onBooked,
}) {
  const addOnIds = useMemo(
    () =>
      (extrasData?.extrasItems || extrasData?.extras || []).map((item) =>
        typeof item === "string" ? item : String(item.id),
      ),
    [extrasData],
  );

  const [quotePricing, setQuotePricing] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!propertyDetails) {
        setQuoteError("Property details missing.");
        setQuoteLoading(false);
        return;
      }
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        // Postman 06 — POST /bookings/quote (flat / house / office)
        const { pricing } = await quoteHomeCleaning({
          propertyDetails,
          addOnIds,
        });
        if (mounted) setQuotePricing(pricing);
      } catch (err) {
        if (mounted) setQuoteError(err?.message || "Could not load quote");
      } finally {
        if (mounted) setQuoteLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [propertyDetails, addOnIds]);

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const scheduleDate =
        schedule?.dateId ||
        (schedule?.date ? String(schedule.date).slice(0, 10) : "");
      const scheduleSlot = schedule?.timeSlotId || "afternoon";
      const addressId = schedule?.addressId;
      if (!addressId) {
        throw new Error("Address missing. Go back and pick schedule again.");
      }

      // Postman 06 — POST /bookings Confirm & Book Cleaning
      const { booking } = await createHomeCleaningBooking({
        propertyDetails,
        addOnIds,
        addressId,
        scheduleDate,
        scheduleSlot,
        markPaid: true,
      });

      const apiId = booking?.id || booking?._id || null;
      const reference =
        booking?.reference ||
        apiId ||
        `HC-${Math.floor(1000 + Math.random() * 9000)}`;

      onBooked?.({
        bookingId: String(reference).replace(/^#/, ""),
        bookingApiId: apiId ? String(apiId).replace(/^#/, "") : null,
        booking,
        total: booking?.pricing?.total ?? quotePricing?.total,
      });
    } catch (err) {
      setConfirmError(err?.message || "Could not confirm booking");
      setConfirming(false);
    }
  };

  if (quoteLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} />
        <Text style={styles.loadingText}>Calculating…</Text>
      </View>
    );
  }

  return (
    <ReviewBooking
      variant="cleaning"
      serviceId="deep"
      propertyDetails={propertyDetails}
      extrasData={extrasData}
      schedule={schedule}
      quotePricing={quotePricing}
      confirming={confirming}
      confirmError={confirmError || quoteError}
      step={5}
      totalSteps={5}
      onBack={onBack}
      onEditSchedule={onEditSchedule}
      onConfirm={handleConfirm}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F3",
    gap: 10,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#6F7975",
  },
});
