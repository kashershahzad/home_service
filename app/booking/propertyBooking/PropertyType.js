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
import { images } from "../../../assets/images/image";
import StepsHeader from "./components/StepsHeader";

const ACCENT = "#0E6E5C";
const ACCENT_SOFT = "#E8F5F0";

const PROPERTIES = [
  {
    id: "flat",
    title: "Flat",
    description: "Apartment or 3BHK",
    icon: images.flat,
  },
  {
    id: "house",
    title: "House",
    description: "Independent home / villa",
    icon: images.house,
  },
  {
    id: "office",
    title: "Office",
    description: "Commercial space",
    icon: images.office,
  },
  {
    id: "room",
    title: "Room",
    description: "Single room",
    icon: images.room,
  },
];

function PropertyCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
      </View>

      <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
        <Image
          source={item.icon}
          style={styles.propertyIcon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
    </TouchableOpacity>
  );
}

export default function PropertyType({
  initialPropertyId = "flat",
  onBack,
  onContinue,
}) {
  const [selectedId, setSelectedId] = useState(initialPropertyId);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader title="Property Type" onBack={onBack} step={2} total={6} />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>What are we cleaning?</Text>
          <Text style={styles.heroSubtitle}>Select your property type.</Text>

          <View style={styles.grid}>
            {PROPERTIES.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onPress={() => setSelectedId(item.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !selectedId && styles.continueBtnDisabled,
            ]}
            onPress={() => selectedId && onContinue?.(selectedId)}
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
    fontSize: 26,
    fontFamily: fonts.bold,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    minHeight: 158,
    alignItems: "center",
  },
  cardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
    backgroundColor: "#C8EADF4D",
  },
  radio: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#BEC9C4CC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },
  radioSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 26,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#BEC9C466",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconBoxSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8EADF",
  },
  propertyIcon: {
    width: 19,
    height: 19,
    tintColor: "#005445",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#191C1C",
    marginBottom: 4,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#3E4945",
    lineHeight: 17,
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EEF2F0",
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: "#111",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 18,
    color: "#4B5563",
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
