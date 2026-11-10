import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fonts } from "../../../assets/fonts/fonts";
import { ensureAddressId } from "../../../utils/booking";
import { fetchCleaningCatalog } from "../../../utils/catalog";
import CleaningReview from "./CleaningReview";
import MatchingStatus from "./confirmedBooking/MatchingStatus";
import { BOOKING_TYPES } from "./confirmedBooking/serviceConfigs";
import ExtrasCondition from "./ExtrasCondition";
import PropertyDetails from "./PropertyDetails";
import PropertyType from "./PropertyType";
import ScheduleAddress from "./ScheduleAddress";

const ACCENT = "#0E6E4C";

export default function BookingLayout() {
  const router = useRouter();
  const [bookingType] = useState(BOOKING_TYPES.HOUSE_CLEANING);

  // Catalog-driven flow starts at "What are we cleaning?"
  const [step, setStep] = useState(1);
  const [propertyId, setPropertyId] = useState("flat");
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [extrasData, setExtrasData] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [bookingId, setBookingId] = useState("HC-8492");
  const [bookingTotal, setBookingTotal] = useState(null);

  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCatalogLoading(true);
      try {
        const data = await fetchCleaningCatalog();
        if (!mounted) return;
        setCatalog(data);
        if (data.propertyTypes?.length) {
          setPropertyId((prev) =>
            data.propertyTypes.some((p) => p.id === prev)
              ? prev
              : data.propertyTypes[0].id,
          );
        }
      } catch (err) {
        console.log("[catalog] home-cleaning failed:", err?.message || err);
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (catalogLoading && !catalog) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} />
        <Text style={styles.loadingText}>Loading cleaning options…</Text>
      </View>
    );
  }

  if (step === 6) {
    const priceLabel =
      bookingTotal != null && Number.isFinite(Number(bookingTotal))
        ? `Rs. ${Number(bookingTotal).toLocaleString("en-PK")}`
        : undefined;
    return (
      <MatchingStatus
        bookingType={bookingType}
        bookingId={bookingId}
        schedule={schedule}
        priceLabel={priceLabel}
        onBack={() => setStep(5)}
      />
    );
  }

  if (step === 5) {
    return (
      <CleaningReview
        propertyDetails={propertyDetails}
        extrasData={extrasData}
        schedule={schedule}
        onBack={() => setStep(4)}
        onEditSchedule={() => setStep(4)}
        onBooked={({ bookingId: id, total }) => {
          setBookingId(id);
          setBookingTotal(total);
          setStep(6);
        }}
      />
    );
  }

  if (step === 4) {
    return (
      <View style={styles.flex}>
        <ScheduleAddress
          initialSchedule={schedule}
          catalogSlug="home-cleaning"
          loadCatalogSlots={!catalog?.timeSlots?.length}
          initialTimeSlots={catalog?.timeSlots}
          step={4}
          totalSteps={5}
          onBack={() => setStep(3)}
          onContinue={async (data) => {
            if (scheduleSubmitting) return;
            setScheduleSubmitting(true);
            setScheduleError(null);
            try {
              if (data?.addressId) {
                setSchedule(data);
              } else {
                const { addressId, address } = await ensureAddressId(
                  data?.address,
                );
                setSchedule({
                  ...data,
                  addressId,
                  address: address || data?.address,
                });
              }
              setStep(5);
            } catch (err) {
              setScheduleError(
                err?.message || "Could not prepare booking address",
              );
            } finally {
              setScheduleSubmitting(false);
            }
          }}
        />
        {scheduleSubmitting ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={ACCENT} />
          </View>
        ) : null}
        {scheduleError ? (
          <Text style={styles.bannerError}>{scheduleError}</Text>
        ) : null}
      </View>
    );
  }

  if (step === 3) {
    return (
      <ExtrasCondition
        initialExtras={extrasData?.extras || []}
        catalogAddOns={catalog?.addOns}
        onBack={() => setStep(2)}
        onContinue={(data) => {
          setExtrasData(data);
          setStep(4);
        }}
      />
    );
  }

  if (step === 2) {
    return (
      <PropertyDetails
        initialPropertyId={propertyId}
        initialDetails={propertyDetails}
        catalog={catalog}
        onBack={() => setStep(1)}
        onContinue={(details) => {
          setPropertyDetails(details);
          setPropertyId(details.propertyId);
          setStep(3);
        }}
      />
    );
  }

  return (
    <PropertyType
      initialPropertyId={propertyId}
      propertyTypes={catalog?.propertyTypes}
      loading={catalogLoading}
      onBack={() =>
        router.canGoBack() ? router.back() : router.replace("/home")
      }
      onContinue={(id) => {
        setPropertyId(id);
        setStep(2);
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6FAF8",
    gap: 10,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#6F7975",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerError: {
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
