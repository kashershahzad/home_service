import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

const ACCENT = "#0E6E4C";
const ACCENT_SOFT = "#E8F5F0";
const ACCENT_BORDER = "#0E6E4C";

const SERVICES = [
  {
    id: "standard",
    title: "Standard Cleaning",
    description: "Regular cleaning for your home",
    price: "2,400",
    badge: "Popular",
    badgeTone: "soft",
    icon: images.standardCleaning,
  },
  {
    id: "deep",
    title: "Deep Cleaning",
    description: "A detailed top-to-bottom clean",
    price: "4,500",
    badge: "Recommended",
    badgeTone: "solid",
    icon: images.deepCleaning,
    extras: ["Disinfection included", "4-5 hrs duration"],
  },
  {
    id: "moveout",
    title: "Move-out Cleaning",
    description: "Leave your space fresh and ready",
    price: "6,000",
    badge: "Relocation",
    badgeTone: "muted",
    icon: images.moveOut,
  },
];

function ServiceCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
          <Image
            source={item.icon}
            style={[
              styles.serviceIcon,
              selected ? styles.iconTintLight : styles.iconTintDark,
            ]}
            resizeMode="contain"
          />
        </View>

        <View
          style={[
            styles.badge,
            item.badgeTone === "solid" && styles.badgeSolid,
            item.badgeTone === "soft" && styles.badgeSoft,
            item.badgeTone === "muted" && styles.badgeMuted,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.badgeTone === "solid" && styles.badgeTextSolid,
              item.badgeTone === "muted" && styles.badgeTextMuted,
            ]}
          >
            {item.badge}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>

      {!!item.extras?.length && (
        <View style={styles.extrasPill}>
          <Ionicons name="shield-checkmark" size={14} color="#0E6E5C" />
          {item.extras.map((extra, index) => (
            <View key={extra} style={styles.extraItem}>
              {index > 0 ? <View style={styles.extraDot} /> : null}
              <Text style={styles.extraText}>{extra}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <Text style={styles.priceText}>
          Starting from <Text style={styles.priceValue}>Rs. {item.price}</Text>
        </Text>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookCleaning({
  initialServiceId = "deep",
  onContinue,
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialServiceId);

  const handleContinue = () => {
    if (!selectedId) return;
    onContinue?.(selectedId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader
          title="Book Cleaning"
          onBack={() => (router.canGoBack() ? router.back() : null)}
          step={1}
          total={6}
          progressLabel="STEP 1 OF 6 • 1 Service"
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>Home Cleaning</Text>
          <Text style={styles.heroSubtitle}>
            Choose the cleaning service that suits your needs.
          </Text>

          {SERVICES.map((item) => (
            <ServiceCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onPress={() => setSelectedId(item.id)}
            />
          ))}

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={18} color={ACCENT} />
            <Text style={styles.infoText}>
              All cleans include 100% Satisfaction Guarantee and vetted
              background-checked specialists.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !selectedId && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedId}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FAF8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  contentBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: fonts.semiBold,
    color: ACCENT,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BEC9C4",
  },
  cardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
    backgroundColor: "#C8EADF66",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    backgroundColor: "#F2F4F3",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "#0E6E5C",
    borderColor: "#0E6E5C",
  },
  serviceIcon: {
    width: 24,
    height: 24,
  },
  iconTintDark: {
    tintColor: "#0E6E5C",
  },
  iconTintLight: {
    tintColor: "#FFFFFF",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSoft: {
    backgroundColor: "#D1FAE5",
  },
  badgeSolid: {
    backgroundColor: "#005445",
  },
  badgeMuted: {
    backgroundColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#005445",
  },
  badgeTextSolid: {
    color: "#fff",
  },
  badgeTextMuted: {
    color: "#6B7280",
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#005445",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6B7280",
    marginBottom: 10,
  },
  extrasPill: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BEC9C4",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  extraItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  extraDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9CA3AF",
  },
  extraText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#4B5563",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E9E7",
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#BEC9C4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    backgroundColor: "#0E6E5C",
    borderColor: "#0E6E5C",
  },
  priceText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6B7280",
    flex: 1,
    paddingRight: 10,
  },
  priceValue: {
    fontSize: 15,
    fontFamily: fonts.extraBold,
    color: "#005445",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EEF2F0",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
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
  continueBtnDisabled: {
    backgroundColor: "#7AAF9A",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
