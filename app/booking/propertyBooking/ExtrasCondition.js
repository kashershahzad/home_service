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
import { fonts } from "../../../assets/fonts/fonts";
import StepsHeader from "./components/StepsHeader";
import { EXTRAS_CATALOG } from "./constants/extras";

const ACCENT = "#0E6E4C";
const ACCENT_SOFT = "#F0F9F5";

function ExtraCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.extraCard, selected && styles.extraCardSelected]}
    >
      <View style={styles.cardTop}>
        <View
          style={[styles.extraIconBox, selected && styles.extraIconBoxSelected]}
        >
          <Image
            source={item.icon}
            style={[
              styles.extraIcon,
              selected ? styles.iconTintLight : styles.iconTintDark,
            ]}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
          {selected ? (
            <Ionicons name="checkmark" size={12} color="#fff" />
          ) : null}
        </View>
      </View>
      <Text style={[styles.extraTitle, selected && styles.extraTitleSelected]}>
        {item.title}
      </Text>
      <Text style={[styles.extraPrice, selected && styles.extraPriceSelected]}>
        +Rs. {item.price}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExtrasCondition({
  initialExtras = ["oven", "windows"],
  onBack,
  onContinue,
}) {
  const [selectedExtras, setSelectedExtras] = useState(initialExtras);

  const toggleExtra = (id) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    onContinue?.({
      extras: selectedExtras,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader
          title="Extras & Condition"
          onBack={onBack}
          step={4}
          total={6}
          progressRight="Space Configuration"
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>Tell us about your space</Text>
          <Text style={styles.heroSubtitle}>
            This helps us give you an accurate price.
          </Text>

          <Text style={styles.sectionLabel}>Any extras?</Text>
          <Text style={styles.sectionHint}>
            Select add-on services needed (multiple allowed)
          </Text>

          <View style={styles.extrasGrid}>
            {EXTRAS_CATALOG.map((item) => (
              <ExtraCard
                key={item.id}
                item={item}
                selected={selectedExtras.includes(item.id)}
                onPress={() => toggleExtra(item.id)}
              />
            ))}
          </View>
        </View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8" },
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
    marginBottom: 22,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#14332C",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6F7975",
    marginBottom: 14,
  },
  extrasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  extraCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    padding: 14,
    minHeight: 128,
  },
  extraCardSelected: {
    borderColor: ACCENT,
    borderWidth: 2,
    backgroundColor: ACCENT_SOFT,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  checkBox: {
    width: 22,
    height: 22,
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
    backgroundColor: "#F2F4F3",
    alignItems: "center",
    justifyContent: "center",
  },
  extraIconBoxSelected: { backgroundColor: ACCENT },
  extraIcon: { width: 22, height: 22 },
  iconTintDark: { tintColor: ACCENT },
  iconTintLight: { tintColor: "#fff" },
  extraTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 4,
  },
  extraTitleSelected: { color: ACCENT },
  extraPrice: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: "#6F7975",
  },
  extraPriceSelected: { color: ACCENT },
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
