import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../../assets/fonts/fonts";
import StepsHeader from "./components/StepsHeader";
import {
  BHK_DEFAULTS,
  PROPERTY_SUBTITLES,
  PROPERTY_TITLES,
} from "./components/propertyDetails/constants";
import FlatContent from "./components/propertyDetails/FlatContent";
import HouseContent from "./components/propertyDetails/HouseContent";
import OfficeContent from "./components/propertyDetails/OfficeContent";
import PropertyTabs from "./components/propertyDetails/PropertyTabs";
import RoomContent from "./components/propertyDetails/RoomContent";
import { ACCENT } from "./components/propertyDetails/theme";

export default function PropertyDetails({
  initialPropertyId = "flat",
  initialDetails,
  onBack,
  onContinue,
}) {
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [sizeMode, setSizeMode] = useState(
    initialDetails?.sizeMode || "preset",
  );
  const [bhk, setBhk] = useState(initialDetails?.bhk || "2bhk");
  const [roomCounts, setRoomCounts] = useState(
    initialDetails?.roomCounts || BHK_DEFAULTS["2bhk"],
  );
  const [plotUnit, setPlotUnit] = useState(initialDetails?.plotUnit || "marla");
  const [plotSize, setPlotSize] = useState(initialDetails?.plotSize || 10);
  const [stories, setStories] = useState(initialDetails?.stories || "double");
  const [areaUnit, setAreaUnit] = useState(initialDetails?.areaUnit || "marla");
  const [areaSize, setAreaSize] = useState(initialDetails?.areaSize || 10);
  const [hasWashrooms, setHasWashrooms] = useState(
    initialDetails?.hasWashrooms || "Yes",
  );
  const [hasKitchen, setHasKitchen] = useState(
    initialDetails?.hasKitchen || "Yes",
  );
  const [roomType, setRoomType] = useState(
    initialDetails?.roomType || "Bedroom",
  );

  useEffect(() => {
    setPropertyId(initialPropertyId);
  }, [initialPropertyId]);

  const title = useMemo(
    () => PROPERTY_TITLES[propertyId] || "Property Details",
    [propertyId],
  );

  const subtitle = useMemo(
    () =>
      PROPERTY_SUBTITLES[propertyId] ||
      "Customize the size and layout of your space.",
    [propertyId],
  );

  const applyBhk = (nextBhk) => {
    setBhk(nextBhk);
    setRoomCounts(BHK_DEFAULTS[nextBhk] || BHK_DEFAULTS["2bhk"]);
  };

  const updateCount = (id, delta) => {
    setRoomCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleContinue = () => {
    onContinue?.({
      propertyId,
      sizeMode,
      bhk: propertyId === "flat" && sizeMode === "preset" ? bhk : null,
      roomCounts,
      plotUnit,
      plotSize,
      stories,
      areaUnit,
      areaSize,
      hasWashrooms,
      hasKitchen,
      roomType,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepsHeader
          title="Property Details"
          onBack={onBack}
          step={3}
          total={6}
          progressRight="Space Configuration"
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>

          <PropertyTabs value={propertyId} onChange={setPropertyId} />

          {propertyId === "flat" ? (
            <FlatContent
              sizeMode={sizeMode}
              onSizeModeChange={setSizeMode}
              bhk={bhk}
              onBhkChange={applyBhk}
              roomCounts={roomCounts}
              onChangeCount={updateCount}
            />
          ) : null}

          {propertyId === "house" ? (
            <HouseContent
              sizeMode={sizeMode}
              onSizeModeChange={setSizeMode}
              plotUnit={plotUnit}
              onPlotUnitChange={setPlotUnit}
              plotSize={plotSize}
              onPlotSizeChange={setPlotSize}
              stories={stories}
              onStoriesChange={setStories}
              roomCounts={roomCounts}
              onChangeCount={updateCount}
            />
          ) : null}

          {propertyId === "office" ? (
            <OfficeContent
              areaUnit={areaUnit}
              onAreaUnitChange={setAreaUnit}
              areaSize={areaSize}
              onAreaSizeChange={setAreaSize}
              hasWashrooms={hasWashrooms}
              onHasWashroomsChange={setHasWashrooms}
              hasKitchen={hasKitchen}
              onHasKitchenChange={setHasKitchen}
            />
          ) : null}

          {propertyId === "room" ? (
            <RoomContent
              areaUnit={areaUnit}
              onAreaUnitChange={setAreaUnit}
              areaSize={areaSize}
              onAreaSizeChange={setAreaSize}
              hasWashrooms={hasWashrooms}
              onHasWashroomsChange={setHasWashrooms}
              hasKitchen={hasKitchen}
              onHasKitchenChange={setHasKitchen}
            />
          ) : null}
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
    marginBottom: 16,
    lineHeight: 20,
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
