import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";
import { TITLE } from "./theme";

export default function StoriesSelector({ stories, value, onChange }) {
  return (
    <>
      <Text style={[styles.label, { marginTop: 8 }]}>Stories</Text>
      <View style={styles.row}>
        {stories.map((item) => {
          const active = item.id === value;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => onChange(item.id)}
            >
              <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                <Image
                  source={item.icon}
                  style={[
                    styles.icon,
                    { tintColor: active ? "#fff" : TITLE },
                  ]}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.title, active && styles.titleActive]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    paddingVertical: 14,
    alignItems: "center",
  },
  cardActive: {
    backgroundColor: "#EBF5F2",
    borderColor: "#0E6E5C",
    borderWidth: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F2F4F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconBoxActive: {
    backgroundColor: "#0E6E5C",
  },
  icon: { width: 14, height: 16 },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  titleActive: { color: TITLE },
});
