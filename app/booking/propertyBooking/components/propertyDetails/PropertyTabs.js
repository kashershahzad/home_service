import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";
import { PROPERTY_TABS } from "./constants";
import { ACCENT } from "./theme";

export default function PropertyTabs({ value, onChange }) {
  return (
    <View style={styles.row}>
      {PROPERTY_TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.id)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
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
  text: { fontSize: 13, fontFamily: fonts.semiBold, color: "#4B5563" },
  textActive: { color: "#fff" },
});
