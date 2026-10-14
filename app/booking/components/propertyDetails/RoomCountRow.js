import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";
import { TITLE } from "./theme";

export default function RoomCountRow({
  item,
  value,
  onDecrement,
  onIncrement,
  isLast,
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.iconBox}>
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.minus} onPress={onDecrement}>
          <Ionicons name="remove" size={16} color="#3E4945" />
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity style={styles.plus} onPress={onIncrement}>
          <Ionicons name="add" size={16} color="#0E6E5C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#C8EADF80",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  icon: { width: 18, height: 18, tintColor: TITLE },
  copy: { flex: 1, paddingRight: 8 },
  title: { fontSize: 16, fontFamily: fonts.semiBold, color: "#14332C" },
  desc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#3E4945",
    marginTop: 2,
  },
  stepperRow: { flexDirection: "row", alignItems: "center" },
  minus: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E4ECE8B3",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: "#C8EADF",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 15,
    fontFamily: fonts.bold,
    color: "#191C1C",
    marginHorizontal: 8,
  },
});
