import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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

const ACCENT = "#0E6E5C";
const ACCENT_SOFT = "#E8F5F0";
const TITLE = "#005445";

const PROPERTY_TABS = [
  { id: "flat", label: "Flat" },
  { id: "house", label: "House" },
  { id: "office", label: "Office" },
  { id: "room", label: "Room" },
];

const BHK_OPTIONS = [
  { id: "studio", label: "Studio" },
  { id: "1bhk", label: "1 BHK" },
  { id: "2bhk", label: "2 BHK" },
  { id: "3bhk", label: "3 BHK" },
  { id: "4bhk", label: "4 BHK" },
];

const BHK_DEFAULTS = {
  studio: {
    livingRoom: 1,
    bedrooms: 0,
    washrooms: 1,
    kitchen: 1,
    terrace: 0,
    garage: 0,
  },
  "1bhk": {
    livingRoom: 1,
    bedrooms: 1,
    washrooms: 1,
    kitchen: 1,
    terrace: 0,
    garage: 0,
  },
  "2bhk": {
    livingRoom: 1,
    bedrooms: 2,
    washrooms: 2,
    kitchen: 1,
    terrace: 1,
    garage: 0,
  },
  "3bhk": {
    livingRoom: 1,
    bedrooms: 3,
    washrooms: 2,
    kitchen: 1,
    terrace: 1,
    garage: 1,
  },
  "4bhk": {
    livingRoom: 1,
    bedrooms: 4,
    washrooms: 3,
    kitchen: 1,
    terrace: 1,
    garage: 1,
  },
};

const FLAT_ROOMS = [
  {
    id: "livingRoom",
    title: "Living room",
    description: "Hall & seating zone.",
    icon: images.livingRoom,
  },
  {
    id: "bedrooms",
    title: "Bedrooms",
    description: "Master & guest rooms.",
    icon: images.bedroom,
  },
  {
    id: "washrooms",
    title: "Washrooms",
    description: "Attached & common baths.",
    icon: images.washroom,
  },
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Cooking & utility area.",
    icon: images.kitchen,
  },
  {
    id: "terrace",
    title: "Terrace",
    description: "Outdoor sit-out spaces.",
    icon: images.terrace,
  },
];

const HOUSE_ROOMS = [
  ...FLAT_ROOMS,
  {
    id: "garage",
    title: "Garage",
    description: "Parking & storage.",
    icon: images.garage,
  },
];

const STORIES = [
  { id: "single", title: "Single", icon: images.storySingle },
  { id: "double", title: "Double", icon: images.storyDouble },
  { id: "basement", title: "Basement", icon: images.storyBasement },
];

const MARLA_CHIPS = ["5", "7", "10", "20"];
const KANAL_CHIPS = ["1", "2", "3", "4"];
const SQFT_CHIPS = ["500", "1000", "1500", "2000"];

function SizeModeCard({ icon, title, subtitle, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.sizeCard, selected && styles.sizeCardSelected]}
    >
      {selected ? (
        <View style={styles.sizeCheckSelected}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      ) : null}
      <Image
        source={icon}
        style={[
          styles.sizeIcon,
          { tintColor: selected ? "#0E6E5C" : "#3E4945" },
        ]}
        resizeMode="contain"
      />
      <Text style={[styles.sizeTitle, selected && styles.sizeTitleSelected]}>
        {title}
      </Text>
      <Text
        style={[styles.sizeSubtitle, selected && styles.sizeSubtitleSelected]}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function RoomCountRow({ item, value, onDecrement, onIncrement, isLast }) {
  return (
    <View style={[styles.roomRow, !isLast && styles.roomRowBorder]}>
      <View style={styles.roomIconBox}>
        <Image
          source={item.icon}
          style={styles.roomIcon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.roomCopy}>
        <Text style={styles.roomTitle}>{item.title}</Text>
        <Text style={styles.roomDesc}>{item.description}</Text>
      </View>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperMinus} onPress={onDecrement}>
          <Ionicons name="remove" size={16} color="#3E4945" />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity style={styles.stepperPlus} onPress={onIncrement}>
          <Ionicons name="add" size={16} color="#0E6E5C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function UnitToggle({ options, value, onChange }) {
  return (
    <View style={styles.unitToggle}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.unitBtn, active && styles.unitBtnActive]}
            onPress={() => onChange(opt.id)}
          >
            <Text style={[styles.unitText, active && styles.unitTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NumberStepper({ value, unitLabel, onDecrement, onIncrement }) {
  return (
    <View style={styles.numberCard}>
      <TouchableOpacity style={styles.stepperMinusLarge} onPress={onDecrement}>
        <Ionicons name="remove" size={18} color="#3E4945" />
      </TouchableOpacity>
      <Text style={styles.numberValue}>
        {value} <Text style={styles.numberUnit}>{unitLabel}</Text>
      </Text>
      <TouchableOpacity style={styles.stepperPlusLarge} onPress={onIncrement}>
        <Ionicons name="add" size={18} color="#0E6E5C" />
      </TouchableOpacity>
    </View>
  );
}

function QuickChips({ options, value, onSelect, suffix = "" }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = String(value) === String(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt}
              {suffix ? ` ${suffix}` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DropdownField({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.dropdownValue}>{value}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={ACCENT}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

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
  const [areaUnit, setAreaUnit] = useState(initialDetails?.areaUnit || "sqft");
  const [areaSize, setAreaSize] = useState(initialDetails?.areaSize || 1000);
  const [hasWashrooms, setHasWashrooms] = useState(
    initialDetails?.hasWashrooms || "Yes",
  );
  const [roomType, setRoomType] = useState(
    initialDetails?.roomType || "Bedroom",
  );

  useEffect(() => {
    setPropertyId(initialPropertyId);
  }, [initialPropertyId]);

  const title = useMemo(() => {
    const map = {
      flat: "Flat Details",
      house: "House Details",
      office: "Office Details",
      room: "Room Details",
    };
    return map[propertyId] || "Property Details";
  }, [propertyId]);

  const subtitle = useMemo(() => {
    const map = {
      flat: "Customize the size and layout of your flat.",
      house: "Customize the size and layout of your house.",
      office: "Customize the size and layout of your office.",
      room: "Customize the size and layout of your room.",
    };
    return map[propertyId] || "Customize the size and layout of your space.";
  }, [propertyId]);

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
      roomType,
    });
  };

  const roomRows = propertyId === "house" ? HOUSE_ROOMS : FLAT_ROOMS;

  const renderFlatContent = () => (
    <>
      <Text style={styles.sectionLabel}>How big is your flat?</Text>
      <View style={styles.sizeRow}>
        <SizeModeCard
          icon={images.presetSize}
          title="Preset size"
          subtitle="Quickly choose by BHK."
          selected={sizeMode === "preset"}
          onPress={() => setSizeMode("preset")}
        />
        <SizeModeCard
          icon={images.customSize}
          title="Custom"
          subtitle="Enter your own room details."
          selected={sizeMode === "custom"}
          onPress={() => setSizeMode("custom")}
        />
      </View>

      {sizeMode === "preset" && (
        <>
          <Text style={styles.sectionLabel}>Select BHK</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bhkRow}
          >
            {BHK_OPTIONS.map((item) => {
              const active = item.id === bhk;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.bhkChip, active && styles.bhkChipActive]}
                  onPress={() => applyBhk(item.id)}
                >
                  <Text
                    style={[styles.bhkText, active && styles.bhkTextActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      <View style={styles.roomHeader}>
        <Text style={styles.sectionLabelInline}>Room counts</Text>
        <Text style={styles.roomHint}>Fine-tune if needed</Text>
      </View>
      <View style={styles.roomCard}>
        {roomRows.map((item, index) => (
          <RoomCountRow
            key={item.id}
            item={item}
            value={roomCounts[item.id] ?? 0}
            onDecrement={() => updateCount(item.id, -1)}
            onIncrement={() => updateCount(item.id, 1)}
            isLast={index === roomRows.length - 1}
          />
        ))}
      </View>
    </>
  );

  const renderHouseContent = () => (
    <>
      <Text style={styles.sectionLabel}>Plot size</Text>
      <View style={styles.sizeRow}>
        <SizeModeCard
          icon={images.plotSize}
          title="Preset size"
          subtitle="Choose standard plot."
          selected={sizeMode === "preset"}
          onPress={() => setSizeMode("preset")}
        />
        <SizeModeCard
          icon={images.customSize2}
          title="Custom"
          subtitle="Enter exact plot size."
          selected={sizeMode === "custom"}
          onPress={() => setSizeMode("custom")}
        />
      </View>

      <View style={styles.areaHeader}>
        <Text style={styles.sectionLabelInline}>Size</Text>
        <UnitToggle
          options={[
            { id: "marla", label: "Marla" },
            { id: "kanal", label: "Kanal" },
          ]}
          value={plotUnit}
          onChange={(id) => {
            setPlotUnit(id);
            setPlotSize(id === "marla" ? 10 : 1);
          }}
        />
      </View>

      <NumberStepper
        value={plotSize}
        unitLabel={plotUnit === "marla" ? "Marla" : "Kanal"}
        onDecrement={() => setPlotSize((v) => Math.max(1, v - 1))}
        onIncrement={() => setPlotSize((v) => v + 1)}
      />

      <QuickChips
        options={plotUnit === "marla" ? MARLA_CHIPS : KANAL_CHIPS}
        value={plotSize}
        onSelect={(v) => setPlotSize(Number(v))}
        suffix={plotUnit === "marla" ? "Marla" : "Kanal"}
      />

      <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Stories</Text>
      <View style={styles.storiesRow}>
        {STORIES.map((item) => {
          const active = item.id === stories;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.storyCard, active && styles.storyCardActive]}
              onPress={() => setStories(item.id)}
            >
              <View
                style={[
                  styles.storyIconBox,
                  active && styles.storyIconBoxActive,
                ]}
              >
                <Image
                  source={item.icon}
                  style={[
                    styles.storyIcon,
                    { tintColor: active ? "#fff" : TITLE },
                  ]}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={[styles.storyTitle, active && styles.storyTitleActive]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.roomHeader}>
        <Text style={styles.sectionLabelInline}>Room counts</Text>
        <Text style={styles.roomHint}>Fine-tune if needed</Text>
      </View>
      <View style={styles.roomCard}>
        {HOUSE_ROOMS.map((item, index) => (
          <RoomCountRow
            key={item.id}
            item={item}
            value={roomCounts[item.id] ?? 0}
            onDecrement={() => updateCount(item.id, -1)}
            onIncrement={() => updateCount(item.id, 1)}
            isLast={index === HOUSE_ROOMS.length - 1}
          />
        ))}
      </View>
    </>
  );

  const renderAreaContent = (label) => (
    <>
      <View style={styles.areaHeader}>
        <Text style={styles.sectionLabelInline}>{label}</Text>
        <UnitToggle
          options={[
            { id: "sqft", label: "sq ft" },
            { id: "sqm", label: "sq m" },
          ]}
          value={areaUnit}
          onChange={setAreaUnit}
        />
      </View>

      <NumberStepper
        value={areaSize}
        unitLabel={areaUnit === "sqft" ? "sq ft" : "sq m"}
        onDecrement={() => setAreaSize((v) => Math.max(100, v - 50))}
        onIncrement={() => setAreaSize((v) => v + 50)}
      />

      <QuickChips
        options={SQFT_CHIPS}
        value={areaSize}
        onSelect={(v) => setAreaSize(Number(v))}
        suffix={areaUnit === "sqft" ? "sq ft" : "sq m"}
      />
    </>
  );

  const renderOfficeContent = () => (
    <>
      {renderAreaContent("Approximate area")}
      <DropdownField
        label="Does this office include washrooms?"
        value={hasWashrooms}
        options={["Yes", "No"]}
        onSelect={setHasWashrooms}
      />
    </>
  );

  const renderRoomContent = () => (
    <>
      {renderAreaContent("Room area")}
      <DropdownField
        label="What type of room is this?"
        value={roomType}
        options={["Bedroom", "Living room", "Store room", "Other"]}
        onSelect={setRoomType}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <StepsHeader
        title="Property Details"
        onBack={onBack}
        step={3}
        total={6}
        progressRight="Space Configuration"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>

        <View style={styles.tabsRow}>
          {PROPERTY_TABS.map((tab) => {
            const active = tab.id === propertyId;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setPropertyId(tab.id)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {propertyId === "flat" && renderFlatContent()}
        {propertyId === "house" && renderHouseContent()}
        {propertyId === "office" && renderOfficeContent()}
        {propertyId === "room" && renderRoomContent()}
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
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#E8EEEC",
    borderRadius: 28,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: ACCENT },
  tabText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#4B5563" },
  tabTextActive: { color: "#fff" },
  sectionLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#14332C",
    marginBottom: 12,
  },
  sectionLabelInline: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#14332C",
  },
  sizeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  sizeCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    padding: 14,
    minHeight: 120,
  },
  sizeCardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
    backgroundColor: "#E8F5F0",
  },
  sizeCheckSelected: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0E6E5C",
    alignItems: "center",
    justifyContent: "center",
  },
  sizeIcon: { width: 18, height: 18, marginBottom: 12 },
  sizeTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 4,
  },
  sizeSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#6F7975",
    lineHeight: 17,
  },
  sizeSubtitleSelected: {
    color: "#46645C",
  },
  bhkRow: { gap: 8, marginBottom: 18, paddingRight: 4 },
  bhkChip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bhkChipActive: {
    borderColor: "#0E6E5C",
    backgroundColor: "#C8EADF66",
    borderWidth: 2,
  },
  bhkText: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  bhkTextActive: { color: ACCENT },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  roomHint: { fontSize: 11, color: "#46645C", fontFamily: fonts.bold },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  roomRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  roomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#C8EADF80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  roomIcon: { width: 18, height: 18, tintColor: TITLE },
  roomCopy: { flex: 1, paddingRight: 8 },
  roomTitle: { fontSize: 16, fontFamily: fonts.semiBold, color: "#14332C" },
  roomDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#3E4945",
    marginTop: 2,
  },
  stepperRow: { flexDirection: "row", alignItems: "center" },
  stepperMinus: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#BEC9C4B3",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperPlus: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#C8EADF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperMinusLarge: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#BEC9C4B3",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperPlusLarge: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#C8EADF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#191C1C",
    marginHorizontal: 8,
  },
  areaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: "#E8EEEC",
    borderRadius: 18,
    padding: 3,
  },
  unitBtn: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  unitBtnActive: { backgroundColor: ACCENT },
  unitText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#4B5563" },
  unitTextActive: { color: "#fff" },
  numberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  numberValue: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: TITLE,
  },
  numberUnit: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#6F7975",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_SOFT,
  },
  chipText: { fontSize: 12, fontFamily: fonts.semiBold, color: "#374151" },
  chipTextActive: { color: ACCENT },
  storiesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  storyCard: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BEC9C466",
    paddingVertical: 14,
    alignItems: "center",
  },
  storyCardActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8EADF",
    borderWidth: 2,
  },
  storyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#BEC9C466",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  storyIconBoxActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  storyIcon: { width: 20, height: 20 },
  storyTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  storyTitleActive: { color: TITLE },
  dropdownWrap: { marginBottom: 16 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    paddingHorizontal: 16,
    height: 52,
  },
  dropdownValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#191C1C",
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
