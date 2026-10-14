import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";
import { ACCENT } from "./theme";

export default function BhkSelector({ options, value, onChange }) {
  return (
    <>
      <Text style={styles.label}>Select BHK</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((item) => {
          const active = item.id === value;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(item.id)}
            >
              <Text style={[styles.text, active && styles.textActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#14332C",
    marginBottom: 12,
  },
  row: { gap: 8, marginBottom: 18, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    height: 38,
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
    borderWidth: 2,
  },
  text: { fontSize: 13, fontFamily: fonts.semiBold, color: "#374151" },
  textActive: { color: ACCENT },
});
