import { StyleSheet, Text, View } from "react-native";
import { fonts } from "../../../../assets/fonts/fonts";
import RoomCountRow from "./RoomCountRow";

export default function RoomCountsCard({ rooms, roomCounts, onChangeCount }) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.label}>Room counts</Text>
        <Text style={styles.hint}>Fine-tune if needed</Text>
      </View>
      <View style={styles.card}>
        {rooms.map((item, index) => (
          <RoomCountRow
            key={item.id}
            item={item}
            value={roomCounts[item.id] ?? 0}
            onDecrement={() => onChangeCount(item.id, -1)}
            onIncrement={() => onChangeCount(item.id, 1)}
            isLast={index === rooms.length - 1}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#14332C",
  },
  hint: { fontSize: 11, color: "#46645C", fontFamily: fonts.bold },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
