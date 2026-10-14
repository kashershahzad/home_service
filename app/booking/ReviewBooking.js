import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../../assets/fonts/fonts";
import { images } from "../../assets/images/image";
import StepsHeader from "./components/StepsHeader";
import {
  EXTRAS_CATALOG,
  SERVICE_FEE,
  SERVICE_PRICES,
} from "./constants/extras";

const ACCENT = "#0E6E4C";

const BHK_LABELS = {
  studio: "Studio",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  "4bhk": "4 BHK",
};

const PROPERTY_LABELS = {
  flat: "Flat",
  house: "House",
  office: "Office",
  room: "Room",
};

function formatCurrency(amount) {
  return `Rs. ${Number(amount).toLocaleString("en-PK")}`;
}

function buildPropertySummary(details = {}) {
  const typeLabel =
    PROPERTY_LABELS[details.propertyId] || details.propertyId || "Property";

  if (details.propertyId === "flat") {
    const bhk =
      details.sizeMode === "preset" && details.bhk
        ? BHK_LABELS[details.bhk] || details.bhk.toUpperCase()
        : null;
    const title = bhk ? `${bhk} Flat` : "Flat";
    const baths = details.roomCounts?.washrooms ?? 0;
    const balcony = details.roomCounts?.terrace ?? 0;
    const parts = [];
    if (baths > 0) {
      parts.push(`${baths} Bathroom${baths > 1 ? "s" : ""}`);
    }
    if (balcony > 0) {
      parts.push(`${balcony} Balcon${balcony > 1 ? "ies" : "y"}`);
    }
    return {
      title,
      subtitle: parts.length ? parts.join(", ") : "Custom layout",
      icon: images.flat,
    };
  }

  if (details.propertyId === "house") {
    const size = details.plotSize
      ? `${details.plotSize} ${details.plotUnit === "kanal" ? "Kanal" : "Marla"}`
      : null;
    return {
      title: size ? `${size} House` : "House",
      subtitle: details.stories
        ? `${details.stories.charAt(0).toUpperCase()}${details.stories.slice(1)} story`
        : "Custom layout",
      icon: images.house,
    };
  }

  if (details.propertyId === "office" || details.propertyId === "room") {
    const unit = details.areaUnit === "sqft" ? "sq ft" : "Marla";
    return {
      title: `${typeLabel}${details.areaSize ? ` · ${details.areaSize} ${unit}` : ""}`,
      subtitle:
        [
          details.hasWashrooms === "Yes" ? "Washrooms" : null,
          details.hasKitchen === "Yes" ? "Kitchen" : null,
        ]
          .filter(Boolean)
          .join(", ") || "Custom layout",
      icon: details.propertyId === "office" ? images.office : images.room,
    };
  }

  return {
    title: typeLabel,
    subtitle: "Custom layout",
    icon: images.bookingHome,
  };
}

function formatScheduleDate(schedule) {
  if (!schedule?.date) return "Date not selected";
  const date = new Date(schedule.date);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function AddonChip({ item }) {
  return (
    <View style={styles.chip}>
      <Image source={item.icon} style={styles.chipIcon} resizeMode="contain" />
      <Text style={styles.chipText}>{item.title}</Text>
    </View>
  );
}

function SummaryRow({ icon, label, rightAction, children, isLast }) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <View style={styles.summaryIconBox}>
        <Image source={icon} style={styles.summaryIcon} resizeMode="contain" />
      </View>
      <View style={styles.summaryBody}>
        <View style={styles.labelRow}>
          <Text style={styles.sectionLabel}>{label}</Text>
          {rightAction}
        </View>
        {children}
      </View>
    </View>
  );
}

export default function ReviewBooking({
  serviceId = "deep",
  propertyDetails,
  extrasData,
  schedule,
  onBack,
  onEditSchedule,
  onConfirm,
}) {
  const selectedExtras = useMemo(() => {
    const ids = extrasData?.extras || [];
    return EXTRAS_CATALOG.filter((item) => ids.includes(item.id));
  }, [extrasData]);

  const property = useMemo(
    () => buildPropertySummary(propertyDetails || {}),
    [propertyDetails],
  );

  const cleaningPrice = SERVICE_PRICES[serviceId] || SERVICE_PRICES.deep;
  const addOnsTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const total = cleaningPrice + addOnsTotal + SERVICE_FEE;

  const addOnsLabel =
    selectedExtras.length > 0
      ? `Add-ons (${selectedExtras.map((e) => e.shortTitle).join(", ")})`
      : "Add-ons";

  const timeLine = schedule?.displayTime
    ? `${schedule.displayTime} (Estimated 4.5 hrs)`
    : "Time not selected";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader
          title="Review Booking"
          onBack={onBack}
          step={6}
          total={6}
          progressRight="Review"
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>Review Your Booking</Text>
          <Text style={styles.heroSubtitle}>
            Please verify all details before confirming.
          </Text>

          <View style={styles.summaryCard}>
            <SummaryRow
              icon={property.icon || images.bookingHome}
              label="PROPERTY"
            >
              <Text style={styles.rowTitle}>{property.title}</Text>
              <Text style={styles.rowSubtitle}>{property.subtitle}</Text>
            </SummaryRow>

            <SummaryRow icon={images.bookingAddOn} label="ADD-ONS">
              {selectedExtras.length ? (
                <View style={styles.chipRow}>
                  {selectedExtras.map((item) => (
                    <AddonChip key={item.id} item={item} />
                  ))}
                </View>
              ) : (
                <Text style={styles.rowSubtitle}>None selected</Text>
              )}
            </SummaryRow>

            <SummaryRow icon={images.bookingDateTime} label="DATE & TIME">
              <Text style={styles.rowTitle}>
                {formatScheduleDate(schedule)}
              </Text>
              <Text style={styles.rowAccent}>{timeLine}</Text>
            </SummaryRow>

            <SummaryRow
              icon={images.bookingAddress}
              label="ADDRESS"
              isLast
              rightAction={
                <TouchableOpacity onPress={onEditSchedule} activeOpacity={0.8}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              }
            >
              <Text style={styles.rowTitle}>
                {schedule?.address?.label || "Home"}
              </Text>
              <Text style={styles.rowSubtitle}>
                {schedule?.address?.line || "Address not selected"}
              </Text>
            </SummaryRow>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Price details</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Cleaning service</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(cleaningPrice)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{addOnsLabel}</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(addOnsTotal)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <View style={styles.feeLabelRow}>
                <Text style={styles.priceLabel}>Service fee & taxes</Text>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#6F7975"
                />
              </View>
              <Text style={styles.priceValue}>
                {formatCurrency(SERVICE_FEE)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.taxNote}>Includes all local taxes</Text>
              </View>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Confirm & Book</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F3" },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  contentBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: "#191C1C",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6F7975",
    marginBottom: 18,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEC9C466",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    gap: 12,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F3F2",
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#C8EADF80",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIcon: { width: 18, height: 18, tintColor: ACCENT },
  summaryBody: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#3E4945",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#3E4945",
    lineHeight: 18,
  },
  rowAccent: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: ACCENT,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 22,
    backgroundColor: "#F2F4F3",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BEC9C466",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 1.5,
    paddingBottom: 2.5,
  },
  chipIcon: { width: 12, height: 12, tintColor: ACCENT },
  chipText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#14332C",
  },
  editLink: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: ACCENT,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEC9C466",
    padding: 16,
  },
  priceTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  feeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    paddingRight: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#3E4945",
    flexShrink: 1,
  },
  priceValue: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#191C1C",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4ECE8",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  totalValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#0E6E5C",
  },
  taxNote: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#3E4945",
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "transparent",
  },
  continueBtn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: { color: "#fff", fontSize: 16, fontFamily: fonts.bold },
});
