import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../assets/fonts/fonts";
import { ensureAddressId } from "../../../utils/booking";
import ScheduleAddress from "../propertyBooking/ScheduleAddress";

export default function HaircutSchedule() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  return (
    <View style={styles.wrap}>
      <ScheduleAddress
        initialSchedule={null}
        hideSteps
        catalogSlug="hair-dressing"
        loadCatalogSlots
        onBack={() => router.back()}
        onContinue={async (schedule) => {
          if (submitting) return;
          setSubmitting(true);
          setError(null);
          try {
            const { addressId, address } = await ensureAddressId(
              schedule?.address,
            );
            const date =
              schedule?.dateId ||
              (schedule?.date
                ? String(schedule.date).slice(0, 10)
                : "");
            router.push({
              pathname: "/booking/bookHaircutService/review",
              params: {
                ...params,
                scheduleDate: date,
                scheduleSlot: schedule?.timeSlotId || "",
                scheduleTime: schedule?.displayTime || "",
                scheduleTimeLabel: schedule?.timeLabel || "",
                scheduleTimeRange: schedule?.timeRange || "",
                addressId,
                addressLabel: address?.label || schedule?.address?.label || "",
                addressLine: address?.line || schedule?.address?.line || "",
                bookingType: "haircut",
              },
            });
          } catch (err) {
            setError(err?.message || "Could not prepare booking address");
          } finally {
            setSubmitting(false);
          }
        }}
      />
      {submitting ? (
        <View style={styles.overlay}>
          <ActivityIndicator color="#0E6E4C" />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    textAlign: "center",
    color: "#B91C1C",
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
