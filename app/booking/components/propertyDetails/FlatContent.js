import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";
import { images } from "../../../../assets/images/image";
import BhkSelector from "./BhkSelector";
import { BHK_OPTIONS, FLAT_ROOMS } from "./constants";
import RoomCountsCard from "./RoomCountsCard";
import SizeModeCard from "./SizeModeCard";

export default function FlatContent({
  sizeMode,
  onSizeModeChange,
  bhk,
  onBhkChange,
  roomCounts,
  onChangeCount,
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>How big is your flat?</Text>
      <View style={styles.sizeRow}>
        <SizeModeCard
          icon={images.presetSize}
          title="Preset size"
          subtitle="Quickly choose by BHK."
          selected={sizeMode === "preset"}
          onPress={() => onSizeModeChange("preset")}
        />
        <SizeModeCard
          icon={images.customSize}
          title="Custom"
          subtitle="Enter your own room details."
          selected={sizeMode === "custom"}
          onPress={() => onSizeModeChange("custom")}
        />
      </View>

      {sizeMode === "preset" ? (
        <BhkSelector options={BHK_OPTIONS} value={bhk} onChange={onBhkChange} />
      ) : null}

      <RoomCountsCard
        rooms={FLAT_ROOMS}
        roomCounts={roomCounts}
        onChangeCount={onChangeCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#14332C",
    marginBottom: 12,
  },
  sizeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
});
