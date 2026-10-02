import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7310FF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide when creating an account, booking services, or contacting support. This may include your name, phone number, email, address, profile photo, and payment details.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to create and manage your account, process bookings, improve our services, send important updates, and provide customer support.",
  },
  {
    title: "3. Sharing of Information",
    body: "We do not sell your personal data. We may share limited information with service providers to complete your bookings, or when required by law.",
  },
  {
    title: "4. Data Security",
    body: "We use industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "5. Your Choices",
    body: "You can update your profile details anytime, manage notifications, or request account deletion by contacting our support team.",
  },
  {
    title: "6. Children's Privacy",
    body: "HomeService is not intended for children under 13. We do not knowingly collect personal information from children.",
  },
  {
    title: "7. Updates to This Policy",
    body: "We may update this Privacy Policy from time to time. Continued use of the app after changes means you accept the updated policy.",
  },
  {
    title: "8. Contact Us",
    body: "If you have questions about this Privacy Policy, email us at support@homeservice.app.",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/profile");
          }}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.updated}>Last updated: September 21, 2026</Text>
        <Text style={styles.intro}>
          This Privacy Policy explains how HomeService collects, uses, and
          protects your personal information when you use our mobile app.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 40,
  },
  updated: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 10,
    marginTop: 4,
  },
  intro: {
    fontSize: 14,
    color: COLORS.subtext,
    lineHeight: 22,
    marginBottom: 18,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: COLORS.subtext,
    lineHeight: 22,
  },
});
