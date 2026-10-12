import { Ionicons } from "@expo/vector-icons";
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

const CONDITIONS = [
  {
    id: "light",
    title: "Light",
    tag: "Baseline",
    tagTone: "muted",
    description: "Maintained regularly, minimal grime.",
  },
  {
    id: "moderate",
    title: "Moderate",
    tag: "Most popular",
    tagTone: "solid",
    description: "Standard dust and regular household use.",
  },
  {
    id: "heavy",
    title: "Heavy",
    tag: "+45 mins",
    tagTone: "danger",
    description: "Deep grime, post-renovation, or vacant space.",
  },
];

const EXTRAS = [
  { id: "oven", title: "Inside oven", price: 400, icon: images.insideOven },
  { id: "fridge", title: "Inside fridge", price: 350, icon: images.insideFridge },
  { id: "windows", title: "Windows", price: 500, icon: images.windows },
  { id: "cabinets", title: "Cabinets", price: 450, icon: images.cabinets },
  { id: "balcony", title: "Balcony", price: 300, icon: images.balconies },
  { id: "laundry", title: "Laundry", price: 600, icon: images.bookingLaundry },
];

function ConditionCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.conditionCard, selected && styles.conditionCardSelected]}
    >
      <View style={styles.conditionLeft}>
        <View style={styles.conditionTitleRow}>
          <Text style={styles.conditionTitle}>{item.title}</Text>
          <View
            style={[
              styles.tag,
              item.tagTone === "solid" && styles.tagSolid,
              item.tagTone === "danger" && styles.tagDanger,
              item.tagTone === "muted" && styles.tagMuted,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                item.tagTone === "solid" && styles.tagTextSolid,
                item.tagTone === "danger" && styles.tagTextDanger,
              ]}
            >
              {item.tag}
            </Text>
          </View>
        </View>
        <Text style={styles.conditionDesc}>{item.description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
    </TouchableOpacity>
  );
}

function ExtraCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.extraCard, selected && styles.extraCardSelected]}
    >
      <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
        {selected ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
      </View>
      <View style={[styles.extraIconBox, selected && styles.extraIconBoxSelected]}>
        <Image
          source={item.icon}
          style={[
            styles.extraIcon,
            selected ? styles.iconTintLight : styles.iconTintDark,
          ]}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.extraTitle}>{item.title}</Text>
      <Text style={styles.extraPrice}>+Rs. {item.price}</Text>
    </TouchableOpacity>
  );
}

export default function ExtrasCondition({
  initialConditionId = "moderate",
  initialExtras = ["oven", "windows"],
  onBack,
  onContinue,
}) {
  const [conditionId, setConditionId] = useState(initialConditionId);
  const [selectedExtras, setSelectedExtras] = useState(initialExtras);

  const toggleExtra = (id) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    onContinue?.({
      conditionId,
      extras: selectedExtras,
    });
  };

  return (
    <View style={styles.container}>
      <StepsHeader
        title="Extras & Condition"
        onBack={onBack}
        step={4}
        total={6}
        progressRight="Condition & Add-ons"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>Tell us about your space</Text>
        <Text style={styles.heroSubtitle}>
          This helps us give you an accurate price.
        </Text>

        <Text style={styles.sectionLabel}>Cleaning Condition</Text>
        {CONDITIONS.map((item) => (
          <ConditionCard
            key={item.id}
            item={item}
            selected={item.id === conditionId}
            onPress={() => setConditionId(item.id)}
          />
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Any extras?</Text>
        <View style={styles.extrasGrid}>
          {EXTRAS.map((item) => (
            <ExtraCard
              key={item.id}
              item={item}
              selected={selectedExtras.includes(item.id)}
              onPress={() => toggleExtra(item.id)}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={ACCENT} />
          <Text style={styles.infoText}>
            Extra services may affect the final price and required cleaning time.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: "#111",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#111",
    marginBottom: 10,
  },
  conditionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 10,
  },
  conditionCardSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_SOFT,
  },
  conditionLeft: { flex: 1, paddingRight: 10 },
  conditionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  conditionTitle: { fontSize: 15, fontFamily: fonts.bold, color: "#111" },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  tagSolid: { backgroundColor: ACCENT },
  tagDanger: { backgroundColor: "#FEE2E2" },
  tagMuted: { backgroundColor: "#E5E7EB" },
  tagText: { fontSize: 10, fontFamily: fonts.bold, color: "#4B5563" },
  tagTextSolid: { color: "#fff" },
  tagTextDanger: { color: "#DC2626" },
  conditionDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#6B7280",
    lineHeight: 17,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  extrasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  extraCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 14,
    minHeight: 130,
  },
  extraCardSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_SOFT,
  },
  checkBox: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkBoxSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  extraIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 2,
  },
  extraIconBoxSelected: { backgroundColor: ACCENT },
  extraIcon: { width: 22, height: 22 },
  iconTintDark: { tintColor: ACCENT },
  iconTintLight: { tintColor: "#fff" },
  extraTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#111",
    marginBottom: 4,
  },
  extraPrice: { fontSize: 12, fontFamily: fonts.semiBold, color: ACCENT },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: ACCENT_SOFT,
    borderRadius: 14,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 18,
    color: "#4B5563",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: "0px 0px 22px 0px rgba(0, 0, 0, 0.08)",
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
