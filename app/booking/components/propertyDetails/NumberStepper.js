import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";

export default function NumberStepper({
  value,
  unitLabel,
  onDecrement,
  onIncrement,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {value} <Text style={styles.unit}>{unitLabel}</Text>
      </Text>
      <View style={styles.btns}>
        <TouchableOpacity style={styles.minus} onPress={onDecrement}>
          <Ionicons name="remove" size={18} color="#3E4945" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plus} onPress={onIncrement}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E4ECE8",
  },
  value: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: "#14332C",
  },
  unit: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#3E4945",
  },
  btns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  minus: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4ECE8B3",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0E6E5C",
    alignItems: "center",
    justifyContent: "center",
  },
});
