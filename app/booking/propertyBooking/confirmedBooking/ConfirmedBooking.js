import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "../../../../assets/images/image";
import fonts from "../../../../components/assets/fonts";
import CustomButton from "../../../../components/components/CustomButton";
import CustomText from "../../../../components/components/CustomText";
import Icons from "../../../../components/components/Icons";
import ScreenWrapper from "../../../../components/components/ScreenWrapper";

const ACCENT = "#0E6E4C";
const PURPLE = "#6E5C9A";
const PURPLE_BG = "#F3EEFF";
const TEXT = "#191C1C";
const MUTED = "#6F7975";

const PLANS = {
  standard: {
    title: "Standard Home Cleaning",
    cleaners: "2 Cleaners",
    hours: "3 Hours",
  },
  deep: {
    title: "Deep Home Cleaning",
    cleaners: "2 Cleaners",
    hours: "5 Hours",
  },
  moveout: {
    title: "Move-out Home Cleaning",
    cleaners: "3 Cleaners",
    hours: "6 Hours",
  },
};

const DEFAULT_ADDRESS = "House #123, Street 5, Block B, Faisalabad";

function formatArrival(schedule) {
  const range = (
    schedule?.timeRange ||
    schedule?.displayTime ||
    "2:00–2:15 PM"
  ).replace(/\s*[–-]\s*/g, "–");

  if (!schedule?.date) return `Today, ${range}`;

  const date = new Date(schedule.date);
  if (Number.isNaN(date.getTime())) return `Today, ${range}`;

  const startOf = (value) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const diffDays = Math.round((startOf(date) - startOf(new Date())) / 86400000);
  const day =
    diffDays === 0
      ? "Today"
      : diffDays === 1
        ? "Tomorrow"
        : date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

  return `${day}, ${range}`;
}

function PlanChip({ icon, label }) {
  return (
    <View style={styles.chip}>
      <Image source={icon} style={styles.chipIcon} resizeMode="contain" />
      <CustomText
        label={label}
        fontSize={12}
        fontFamily={fonts.semiBold}
        color={TEXT}
      />
    </View>
  );
}

export default function ConfirmedBooking({
  serviceId = "standard",
  schedule,
  bookingId = "HC8427391",
  onBack,
  onViewSummary,
  onTrack,
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);
  const plan = PLANS[serviceId] || PLANS.standard;
  const address = schedule?.address?.line || DEFAULT_ADDRESS;
  const arrival = formatArrival(schedule);
  const bookingLabel = `#${bookingId}`;

  const copyBookingId = async () => {
    const value = bookingLabel;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
    } catch {
      // Clipboard is unavailable on this device.
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ScreenWrapper
      backgroundColor="#FFFFFF"
      statusBarColor="#FFFFFF"
      paddingHorizontal={20}
      scrollEnabled={false}
      headerUnScrollable={() => (
        <View style={styles.headerRow}>
          <View style={styles.backSlot}>
            <Icons
              family="Ionicons"
              name="chevron-back"
              size={24}
              color={TEXT}
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            />
          </View>
          <CustomText
            label="House Cleaning"
            fontFamily={fonts.bold}
            fontSize={17}
            color={TEXT}
            textAlign="center"
            width="100%"
            containerStyle={styles.headerTitle}
          />
          <View style={styles.backSlot} />
        </View>
      )}
      footerUnScrollable={() => (
        <View style={styles.footer}>
          <CustomButton
            title="Track Your Booking  →"
            onPress={onTrack}
            backgroundColor={ACCENT}
            color="#FFFFFF"
            height={54}
            borderRadius={12}
            fontSize={16}
            fontFamily={fonts.regular}
          />
          <CustomText
            label="View Booking Summary"
            color={"#0E6E4C"}
            fontFamily={fonts.semiBold}
            fontSize={14}
            textAlign="center"
            alignSelf="center"
            marginTop={16}
            onPress={onViewSummary}
          />
        </View>
      )}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={images.confirmedBooking}
          style={styles.hero}
          resizeMode="contain"
        />

        <CustomText
          label="Booking Confirmed!"
          fontFamily={fonts.extraBold}
          fontSize={28}
          color={"#17121F"}
          textAlign="center"
          alignSelf="center"
        />
        <CustomText
          label="Your home cleaning service has been successfully booked."
          fontFamily={fonts.regular}
          fontSize={14}
          color={"#6F6878"}
          textAlign="center"
          alignSelf="center"
          marginTop={5}
          containerStyle={styles.subtitle}
        />

        <View style={styles.arrivalPill}>
          <Image
            source={images.confirmedBookingTime}
            style={styles.arrivalIcon}
            resizeMode="contain"
          />
          <Text style={styles.arrivalLabel}>
            Estimated arrival:{" "}
            <Text style={styles.arrivalValue}>{arrival}</Text>
          </Text>
        </View>

        <View style={styles.bookingIdRow}>
          <Text style={styles.bookingIdLabel}>Booking ID:</Text>
          <TouchableOpacity
            style={styles.bookingIdPill}
            onPress={copyBookingId}
            activeOpacity={0.75}
          >
            <Text style={styles.bookingIdValue}>
              {copied ? "Copied" : bookingLabel}
            </Text>
            <Icons
              family="Ionicons"
              name="copy-outline"
              size={14}
              color={ACCENT}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planCopy}>
              <CustomText
                label="CONFIRMED PLAN"
                fontFamily={fonts.bold}
                fontSize={11}
                color={ACCENT}
                letterSpacing={0.6}
              />
              <CustomText
                label={plan.title}
                fontFamily={fonts.semiBold}
                fontSize={18}
                color={"#17121F"}
                marginTop={6}
              />
            </View>
            <View style={styles.brushBox}>
              <Image
                source={images.brush}
                style={styles.brushIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.chipRow}>
            <PlanChip icon={images.clearners} label={plan.cleaners} />
            <PlanChip icon={images.stopwatch} label={plan.hours} />
            <PlanChip icon={images.insured} label="Insured" />
          </View>

          <View style={styles.divider} />

          <View style={styles.locationRow}>
            <View style={styles.locationIconBox}>
              <Icons
                family="Ionicons"
                name="location-sharp"
                size={16}
                color={ACCENT}
              />
            </View>
            <View style={styles.locationCopy}>
              <CustomText
                label="SERVICE LOCATION"
                fontFamily={fonts.bold}
                fontSize={11}
                color="#6F6878"
                letterSpacing={0.5}
              />
              <CustomText
                label={address}
                fontFamily={fonts.regular}
                fontSize={14}
                color="#17121F"
                lineHeight={20}
                marginTop={4}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 52,
  },
  backSlot: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 16,
  },
  hero: {
    width: 176,
    height: 160,
    marginTop: 6,
  },
  subtitle: {
    maxWidth: 280,
  },
  arrivalPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: "100%",
    backgroundColor: PURPLE_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 18,
    gap: 6,
  },
  arrivalIcon: {
    width: 14,
    height: 14,
    tintColor: ACCENT,
    flexShrink: 0,
  },
  arrivalLabel: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.semiBold,
    color: "#17121F",
  },
  arrivalValue: {
    color: ACCENT,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  bookingIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  bookingIdLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: MUTED,
  },
  bookingIdPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PURPLE_BG,
    borderRadius: 16,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 5,
    gap: 6,
  },
  bookingIdValue: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semiBold,
    color: ACCENT,
  },
  planCard: {
    width: "100%",
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E5ED",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planCopy: {
    flex: 1,
    paddingTop: 2,
  },
  brushBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PURPLE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  brushIcon: {
    width: 22,
    height: 22,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE_BG,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  chipIcon: {
    width: 14,
    height: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEEC",
    marginTop: 18,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
  },
  locationIconBox: {
    width: 28,
    height: 30,
    borderRadius: 18,
    backgroundColor: PURPLE_BG,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  locationCopy: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
