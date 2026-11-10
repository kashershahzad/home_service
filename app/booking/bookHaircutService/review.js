import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../assets/fonts/fonts";
import { images } from "../../../assets/images/image";
import {
  createHairDressingBooking,
  parseAddOnIds,
  parseAddOns,
  quoteHairDressing,
} from "../../../utils/booking";
import ReviewBooking from "../propertyBooking/ReviewBooking";

const ACCENT = "#0E6E4C";

export default function HaircutReviewBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const packageId = String(params.packageId || "");
  const addOnIds = useMemo(
    () => parseAddOnIds(params.addOnIds),
    [params.addOnIds],
  );
  const addOnItems = useMemo(() => {
    const fromParams = parseAddOns(params.addOns);
    if (fromParams.length) {
      return fromParams.map((item) => ({
        ...item,
        id: String(item.id),
        title: item.title || item.shortTitle || "Add-on",
        shortTitle: item.shortTitle || item.title || "Add-on",
        icon: images.hair,
        price: Number(item.price) || 0,
      }));
    }
    return addOnIds.map((id) => ({
      id,
      title: "Add-on",
      shortTitle: "Add-on",
      icon: images.hair,
      price: 0,
    }));
  }, [params.addOns, addOnIds]);

  const schedule = useMemo(
    () => ({
      date: params.scheduleDate || null,
      dateId: params.scheduleDate || null,
      timeSlotId: params.scheduleSlot || "",
      displayTime: params.scheduleTime || "",
      timeLabel: params.scheduleTimeLabel || "",
      timeRange: params.scheduleTimeRange || "",
      address: {
        label: params.addressLabel || "Home",
        line: params.addressLine || "",
      },
    }),
    [params],
  );

  const packageInfo = useMemo(
    () => ({
      title: params.packageTitle || "Hair package",
      duration: params.packageDuration || "",
      category: params.category || "men",
      priceRaw: Number(params.price) || 0,
      icon: images.scissors,
    }),
    [params],
  );

  const [quotePricing, setQuotePricing] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!packageId) {
        setQuoteError("Package missing. Go back and select a package.");
        setQuoteLoading(false);
        return;
      }
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        // Postman 07 — Quote men / kids (same endpoint, dynamic packageId + addOnIds)
        const { pricing } = await quoteHairDressing({
          packageId,
          addOnIds,
        });
        if (mounted) setQuotePricing(pricing);
      } catch (err) {
        if (mounted) {
          setQuoteError(err?.message || "Could not load quote");
        }
      } finally {
        if (mounted) setQuoteLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [packageId, params.addOnIds]);

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      // Postman 07 — Confirm & Book Salon
      const { booking } = await createHairDressingBooking({
        packageId,
        addOnIds,
        addressId: String(params.addressId || ""),
        scheduleDate: String(params.scheduleDate || ""),
        scheduleSlot: String(params.scheduleSlot || "evening"),
        markPaid: true,
      });
      const bookingId =
        booking?.id ||
        booking?._id ||
        booking?.reference ||
        `HS-${Math.floor(1000 + Math.random() * 9000)}`;
      const total =
        booking?.pricing?.total ??
        quotePricing?.total ??
        packageInfo.priceRaw;

      router.replace({
        pathname: "/booking/bookHaircutService/confirmed",
        params: {
          bookingId: String(bookingId),
          scheduleTime: schedule.displayTime || "",
          addressLine: schedule.address?.line || "",
          packageTitle: packageInfo.title,
          total: String(total ?? ""),
        },
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
        <Text style={styles.loadingText}>Getting your quote…</Text>
      </View>
    );
  }

  return (
    <ReviewBooking
      variant="package"
      hideSteps
      packageInfo={packageInfo}
      quotePricing={quotePricing}
      extrasData={{ extrasItems: addOnItems }}
      schedule={schedule}
      confirming={confirming}
      confirmError={confirmError || quoteError}
      onBack={() => router.back()}
      onEditSchedule={() => router.back()}
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
