import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";
import NumberStepper from "./NumberStepper";
import QuickChips from "./QuickChips";
import UnitToggle from "./UnitToggle";

export default function UnitMeasurementBlock({
  title = "Unit Measurement",
  unitOptions,
  unitValue,
  onUnitChange,
  sizeValue,
  unitLabel,
  onDecrement,
  onIncrement,
  chipOptions,
  onChipSelect,
  chipSuffix = "",
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <UnitToggle
          options={unitOptions}
          value={unitValue}
          onChange={onUnitChange}
        />
      </View>
      <NumberStepper
        value={sizeValue}
        unitLabel={unitLabel}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
      />
      <QuickChips
        options={chipOptions}
        value={sizeValue}
        onSelect={onChipSelect}
        suffix={chipSuffix}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    padding: 14,
    marginBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#3E4945",
  },
});
