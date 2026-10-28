import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";

export default function DropdownField({
  title,
  subtitle,
  label,
  value,
  options,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const question = subtitle || label;

  return (
    <View style={styles.wrap}>
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!question && <Text style={styles.subtitle}>{question}</Text>}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.value}>{value}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#191C1C"
        />
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.item}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text style={styles.itemText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#3E4945",
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BEC9C44D",
    paddingHorizontal: 16,
    height: 46,
  },
  value: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#191C1C",
  },
  menu: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    overflow: "hidden",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#191C1C",
  },
});
