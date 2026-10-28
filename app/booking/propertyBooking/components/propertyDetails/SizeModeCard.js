import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../../assets/fonts/fonts";

export default function SizeModeCard({
  icon,
  title,
  subtitle,
  selected,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected ? (
        <View style={styles.checkSelected}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      ) : null}
      <Image
        source={icon}
        style={[styles.icon, { tintColor: selected ? "#0E6E5C" : "#3E4945" }]}
        resizeMode="contain"
      />
      <Text style={[styles.title, selected && styles.titleSelected]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    padding: 14,
    minHeight: 120,
  },
  cardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
    backgroundColor: "#E8F5F0",
  },
  checkSelected: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0E6E5C",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { width: 18, height: 18, marginBottom: 12 },
  title: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 4,
  },
  titleSelected: { color: "#46645C" },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#6F7975",
    lineHeight: 17,
  },
  subtitleSelected: { color: "#46645C" },
});
