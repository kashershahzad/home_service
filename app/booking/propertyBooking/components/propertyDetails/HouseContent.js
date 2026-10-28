import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";
import { images } from "../../../../../assets/images/image";
import {
  HOUSE_ROOMS,
  KANAL_CHIPS,
  MARLA_CHIPS,
  STORIES,
} from "./constants";
import RoomCountsCard from "./RoomCountsCard";
import SizeModeCard from "./SizeModeCard";
import StoriesSelector from "./StoriesSelector";
import UnitMeasurementBlock from "./UnitMeasurementBlock";

export default function HouseContent({
  sizeMode,
  onSizeModeChange,
  plotUnit,
  onPlotUnitChange,
  plotSize,
  onPlotSizeChange,
  stories,
  onStoriesChange,
  roomCounts,
  onChangeCount,
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>Plot size</Text>
      <View style={styles.sizeRow}>
        <SizeModeCard
          icon={images.plotSize}
          title="Preset size"
          subtitle="Choose standard plot."
          selected={sizeMode === "preset"}
          onPress={() => onSizeModeChange("preset")}
        />
        <SizeModeCard
          icon={images.customSize2}
          title="Custom"
          subtitle="Enter exact plot size."
          selected={sizeMode === "custom"}
          onPress={() => onSizeModeChange("custom")}
        />
      </View>

      <UnitMeasurementBlock
        title="Unit Measurement"
        unitOptions={[
          { id: "marla", label: "Marla" },
          { id: "kanal", label: "Kanal" },
        ]}
        unitValue={plotUnit}
        onUnitChange={(id) => {
          onPlotUnitChange(id);
          onPlotSizeChange(id === "marla" ? 10 : 1);
        }}
        sizeValue={plotSize}
        unitLabel={plotUnit === "marla" ? "Marla" : "Kanal"}
        onDecrement={() =>
          onPlotSizeChange((v) => Math.max(1, v - 1))
        }
        onIncrement={() => onPlotSizeChange((v) => v + 1)}
        chipOptions={plotUnit === "marla" ? MARLA_CHIPS : KANAL_CHIPS}
        onChipSelect={(v) => onPlotSizeChange(Number(v))}
        chipSuffix={plotUnit === "marla" ? "Marla" : "Kanal"}
      />

      <StoriesSelector
        stories={STORIES}
        value={stories}
        onChange={onStoriesChange}
      />

      <RoomCountsCard
        rooms={HOUSE_ROOMS}
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
