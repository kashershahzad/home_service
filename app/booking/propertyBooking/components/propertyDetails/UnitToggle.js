import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";

export default function UnitToggle({ options, value, onChange }) {
  return (
    <View style={styles.toggle}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.btn, active && styles.btnActive]}
            onPress={() => onChange(opt.id)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    backgroundColor: "#F1F4F2",
    borderRadius: 18,
    padding: 3,
  },
  btn: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnActive: { backgroundColor: "#FFFFFF" },
  text: { fontSize: 12, fontFamily: fonts.semiBold, color: "#4B5563" },
  textActive: { color: "#0E6E5C" },
});
