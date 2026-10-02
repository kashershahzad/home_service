import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#EEEEEE",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const CONTACT_ITEMS = [
  {
    key: "customer",
    label: "Customer Service",
    value: "support@homeservice.app",
    icon: "headset-outline",
    color: "#7310FF",
    bg: "#F1E7FF",
    action: () => Linking.openURL("mailto:support@homeservice.app"),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: "+92 300 1234567",
    icon: "logo-whatsapp",
    color: "#25D366",
    bg: "#E8F8EF",
    action: () => Linking.openURL("https://wa.me/923001234567"),
  },
  {
    key: "website",
    label: "Website",
    value: "www.homeservice.app",
    icon: "globe-outline",
    color: "#3AAFFF",
    bg: "#E4F6FF",
    action: () => Linking.openURL("https://homeservice.app"),
  },
  {
    key: "facebook",
    label: "Facebook",
    value: "@HomeServiceApp",
    icon: "logo-facebook",
    color: "#1877F2",
    bg: "#E8F1FF",
    action: () => Linking.openURL("https://facebook.com"),
  },
  {
    key: "twitter",
    label: "Twitter",
    value: "@HomeServiceApp",
    icon: "logo-twitter",
    color: "#1DA1F2",
    bg: "#E7F6FE",
    action: () => Linking.openURL("https://twitter.com"),
  },
  {
    key: "instagram",
    label: "Instagram",
    value: "@homeservice.app",
    icon: "logo-instagram",
    color: "#E4405F",
    bg: "#FDECEF",
    action: () => Linking.openURL("https://instagram.com"),
  },
];

export default function ContactUsScreen() {
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Have a question or need help? Reach out through any of the channels
          below.
        </Text>

        {CONTACT_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.75}
            onPress={item.action}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    lineHeight: 21,
    marginBottom: 20,
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: COLORS.subtext,
  },
});
