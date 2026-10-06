import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  text: "#000000",
  subtext: "#6B6B6B",
};

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = params?.title ? String(params.title) : "your service";
  const date = params?.date ? String(params.date) : "";
  const startTime = params?.startTime ? String(params.startTime) : "";
  const total = params?.total ? String(params.total) : params?.price || "0";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconRing}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={42} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>Booking Successful!</Text>
        <Text style={styles.subtitle}>
          Your booking for {title} has been confirmed
          {date ? ` on ${date}` : ""}
          {startTime ? ` at ${startTime}` : ""}.
        </Text>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Paid</Text>
          <Text style={styles.amountValue}>Rs.{total}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.replace("/bookings")}
        >
          <Text style={styles.primaryButtonText}>View Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 26,
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  amountCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: "center",
    minWidth: 180,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === "ios" ? 24 : 28,
    gap: 12,
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
  secondaryButton: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 40,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});
