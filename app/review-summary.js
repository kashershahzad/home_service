import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../assets/images/image";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#EEEEEE",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const METHOD_LABELS = {
  paypal: "PayPal",
  google: "Google Pay",
  apple: "Apple Pay",
  mastercard: "•••• •••• •••• 4679",
  cash: "Cash",
};

const METHOD_ICONS = {
  paypal: images.paypalIcon,
  google: images.googlePayIcon,
  apple: images.applePayIcon,
  mastercard: images.mastercardIcon,
  cash: images.cashIcon,
};

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function ReviewSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = params?.title ? String(params.title) : "Service";
  const name = params?.name ? String(params.name) : "Provider";
  const price = Number(params?.price || 0);
  const image = params?.image ? String(params.image) : null;
  const date = params?.date ? String(params.date) : "—";
  const startTime = params?.startTime ? String(params.startTime) : "—";
  const workingHours = params?.workingHours ? String(params.workingHours) : "0";
  const address = params?.address ? String(params.address) : "—";
  const promoCode = params?.promoCode ? String(params.promoCode) : "";
  const paymentMethod = params?.paymentMethod
    ? String(params.paymentMethod)
    : "cash";

  const hoursNum = Number(workingHours) || 1;
  const subtotal = price * Math.max(hoursNum, 1);
  const discount = promoCode ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(subtotal - discount, 0);

  const confirmBooking = () => {
    router.push({
      pathname: "/booking-success",
      params: {
        ...params,
        total: String(total),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Summary</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.serviceCard}>
          {image ? (
            <Image source={{ uri: image }} style={styles.serviceImage} />
          ) : (
            <View style={[styles.serviceImage, styles.imagePlaceholder]}>
              <Ionicons name="construct-outline" size={28} color={COLORS.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <Text style={styles.serviceName}>{name}</Text>
            <Text style={styles.servicePrice}>Rs.{price}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          <Row label="Date" value={date} />
          <Row label="Time" value={startTime} />
          <Row label="Working Hours" value={`${workingHours} hrs`} />
          <Row label="Address" value={address} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            <Image
              source={METHOD_ICONS[paymentMethod] || images.cashIcon}
              style={styles.paymentIcon}
              resizeMode="contain"
            />
            <Text style={styles.paymentLabel}>
              {METHOD_LABELS[paymentMethod] || "Cash"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <Row label="Subtotal" value={`Rs.${subtotal}`} />
          {!!promoCode && (
            <Row label={`Promo (${promoCode})`} value={`-Rs.${discount}`} />
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs.{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={confirmBooking}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 22,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  serviceImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  serviceName: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 16,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    flexShrink: 0,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: { width: 28, height: 28 },
  paymentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 28,
    backgroundColor: COLORS.card,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
