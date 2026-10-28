import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { fonts } from "../../../assets/fonts/fonts";
import { images } from "../../../assets/images/image";

const ACCENT = "#0E6E5C";
const SELECTED_BG = "#E4F3EF";
const BG = "#F6FAF8";
const HEADER_BG = "#FFFFFF";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const SPECIAL_BG = "#EDE7F6";
const SPECIAL_TEXT = "#5E35B1";

const MEN_PACKAGES = [
  {
    id: "basic",
    title: "Basic",
    description: "Haircut, beard trim",
    price: "1,200",
    duration: "35 mins",
  },
  {
    id: "grooming",
    title: "Grooming",
    description: "Haircut, beard trim, head massage",
    price: "2,000",
    duration: "50 mins",
    recommended: true,
  },
  {
    id: "premium",
    title: "Premium",
    description: "Haircut, beard trim, facial, massage",
    price: "3,500",
    duration: "75 mins",
  },
  {
    id: "groom",
    title: "Groom (Dulha)",
    description: "Styling, facial, massage",
    price: "6,500",
    duration: "120 mins",
    special: true,
  },
];

const CHILDREN_PACKAGES = [
  {
    id: "kids-basic",
    title: "Kids Basic",
    description: "Haircut, hair wash",
    price: "800",
    duration: "25 mins",
  },
  {
    id: "kids-style",
    title: "Kids Style",
    description: "Fade or design, hair wash",
    price: "1,200",
    duration: "35 mins",
  },
  {
    id: "newborn-aqiqah",
    title: "Newborn Aqiqah",
    description: "Shaving and hair collection",
    price: "2,500",
    duration: "40 mins",
    gentleCare: true,
  },
];

function PackageCard({ item, selected, onPress, durationFirst = false }) {
  const active = selected;

  const durationBlock = (
    <View style={styles.durationRow}>
      <Image
        source={images.time2}
        style={[styles.timeIcon, active && styles.timeIconActive]}
        resizeMode="contain"
      />
      <Text style={[styles.duration, active && styles.durationActive]}>
        {item.duration}
      </Text>
    </View>
  );

  const priceBlock = (
    <Text style={[styles.price, active && styles.priceActive]}>
      Rs. {item.price}
    </Text>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, active && styles.cardSelected]}
    >
      {item.recommended ? (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      ) : null}

      <Image
        source={active ? images.radioChecked : images.radioUnchecked}
        style={[
          styles.checkIcon,
          item.recommended && styles.checkIconRecommended,
        ]}
        resizeMode="contain"
      />

      <View style={styles.titleRow}>
        <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
          {item.title}
        </Text>
        {item.special ? (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>Special</Text>
          </View>
        ) : null}
        {item.gentleCare ? (
          <View style={styles.gentleCareBadge}>
            <Image
              source={images.gentleCareIcon}
              style={styles.gentleCareIcon}
              resizeMode="contain"
            />
            <Text style={styles.gentleCareText}>Gentle Care</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.cardDesc, active && styles.cardDescActive]}>
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        {durationFirst ? durationBlock : priceBlock}
        <Text style={styles.metaDot}>•</Text>
        {durationFirst ? priceBlock : durationBlock}
      </View>
    </TouchableOpacity>
  );
}

export default function HaircutPackages() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params?.category || "men";
  const isMen = category !== "children";
  const packages = isMen ? MEN_PACKAGES : CHILDREN_PACKAGES;
  const [selectedId, setSelectedId] = useState(
    isMen ? "grooming" : "newborn-aqiqah",
  );

  const title = isMen ? "Men's Packages" : "Children's Packages";
  const subtitle = isMen
    ? "Choose a package and add extras."
    : "Choose a package for your child.";

  const selectedPackage = packages.find((p) => p.id === selectedId);

  const handleContinue = () => {
    if (!selectedPackage) return;
    router.push({
      pathname: "/booking/bookHaircutService/schedule",
      params: {
        ...params,
        category: String(category),
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        packageDuration: selectedPackage.duration,
        price: selectedPackage.price?.replace(/,/g, "") || params?.price,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>

        <View style={styles.list}>
          {packages.map((item) => (
            <PackageCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onPress={() => setSelectedId(item.id)}
              durationFirst={!isMen}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueBtn}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === "ios" ? 54 : 28,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: "#191C1C",
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: "#1F2937",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#555F6F",
    marginBottom: 20,
  },
  list: {
    gap: 14,
    overflow: "visible",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BEC9C480",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    position: "relative",
    overflow: "visible",
  },
  cardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
    backgroundColor: "#F3F8F6",
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: ACCENT,
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  recommendedText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 15,
    color: "#fff",
    letterSpacing: 0.3,
  },
  checkIcon: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 24,
    height: 24,
  },
  checkIconRecommended: {
    top: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 36,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: "#1F2937",
  },
  cardTitleActive: {
    color: "#0E6E5C",
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  specialBadge: {
    backgroundColor: "#D9E3F6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  specialText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: "#121C2A",
  },
  gentleCareBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E6E5C",
    borderRadius: 9999,
    paddingVertical: 2,
    paddingHorizontal: 10,
    gap: 4,
    marginTop: 2,
  },
  gentleCareIcon: {
    width: 10,
    height: 10,
  },
  gentleCareText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: "#fff",
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#555F6F",
    marginBottom: 12,
    paddingRight: 28,
  },
  cardDescActive: {
    color: "#3E4945",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#1F2937",
  },
  priceActive: {
    color: "#0E6E5C",
  },
  metaDot: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeIcon: {
    width: 12,
    height: 12,
    marginTop: 2,
  },
  timeIconActive: {
    tintColor: ACCENT,
  },
  duration: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#555F6F",
  },
  durationActive: {
    color: "#3E4945",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
  },
  continueBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#fff",
  },
});
