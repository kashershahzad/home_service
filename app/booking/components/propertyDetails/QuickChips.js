import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";

export default function QuickChips({ options, value, onSelect, suffix = "" }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = String(value) === String(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {opt}
              {suffix ? ` ${suffix}` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: "#0E6E5C",
    backgroundColor: "#C8EADF66",
  },
  text: { fontSize: 12, fontFamily: fonts.semiBold, color: "#374151" },
  textActive: { color: "#0E6E5C" },
});
