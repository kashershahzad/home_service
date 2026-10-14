import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../../assets/fonts/fonts";
import { images } from "../../assets/images/image";
import StepsHeader from "./components/StepsHeader";

const ACCENT = "#0E6E4C";
const CARD_BG = "#F2F4F3";
const ACTIVE_BG = "#C8EADF";

const TIME_SLOTS = [
  {
    id: "morning",
    title: "Morning",
    range: "8:00 AM – 11:00 AM",
    displayTime: "8:00 AM",
    icon: images.morning,
  },
  {
    id: "afternoon",
    title: "Afternoon",
    range: "12:00 PM – 3:00 PM",
    displayTime: "12:00 PM",
    icon: images.afternoon,
  },
  {
    id: "evening",
    title: "Evening",
    range: "4:00 PM – 7:00 PM",
    displayTime: "4:00 PM",
    icon: images.evening,
  },
];

const DEFAULT_ADDRESS = {
  label: "Home",
  line: "House # 123, Street 5, Block B, Faisalabad",
};

function buildDateOptions(count = 7) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: date.toISOString().slice(0, 10),
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: String(date.getDate()),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });
}

function TimeSlotCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.timeCard, selected && styles.timeCardSelected]}
    >
      <View style={styles.timeLeft}>
        <View
          style={[styles.timeIconBox, selected && styles.timeIconBoxSelected]}
        >
          <Image
            source={item.icon}
            style={styles.timeIcon}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.timeTitle}>{item.title}</Text>
          <Text style={styles.timeRange}>{item.range}</Text>
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ScheduleAddress({
  initialSchedule,
  onBack,
  onContinue,
}) {
  const dateOptions = useMemo(() => buildDateOptions(7), []);
  const [selectedDateId, setSelectedDateId] = useState(
    initialSchedule?.dateId || dateOptions[2]?.id || dateOptions[0]?.id,
  );
  const [timeSlotId, setTimeSlotId] = useState(
    initialSchedule?.timeSlotId || "afternoon",
  );
  const [address] = useState(initialSchedule?.address || DEFAULT_ADDRESS);

  const selectedDate = dateOptions.find((d) => d.id === selectedDateId);
  const monthLabel = selectedDate
    ? selectedDate.date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const handleContinue = () => {
    const slot = TIME_SLOTS.find((s) => s.id === timeSlotId);
    onContinue?.({
      dateId: selectedDateId,
      date: selectedDate?.date?.toISOString?.() || null,
      timeSlotId,
      timeLabel: slot?.title,
      timeRange: slot?.range,
      displayTime: slot?.displayTime,
      address,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader
          title="Schedule & Address"
          onBack={onBack}
          step={5}
          total={6}
          progressRight="Schedule"
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>When should we come?</Text>
          <Text style={styles.heroSubtitle}>
            Choose a convenient date and time.
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Select Date</Text>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dateOptions.map((item) => {
              const active = item.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.dateCard, active && styles.dateCardActive]}
                  onPress={() => setSelectedDateId(item.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.dateDay, active && styles.dateTextActive]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[styles.dateNum, active && styles.dateTextActive]}
                  >
                    {item.dayNum}
                  </Text>
                  <Text
                    style={[styles.dateMonth, active && styles.dateTextActive]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>
            Preferred time
          </Text>
          <View style={styles.timeList}>
            {TIME_SLOTS.map((item) => (
              <TimeSlotCard
                key={item.id}
                item={item}
                selected={item.id === timeSlotId}
                onPress={() => setTimeSlotId(item.id)}
              />
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
            Service address
          </Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIconBox}>
              <Image
                source={images.bookingHome}
                style={styles.addressIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.addressCopy}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressTitle}>{address.label}</Text>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.addressLine}>{address.line}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8" },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  contentBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: "#191C1C",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6F7975",
    marginBottom: 22,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#0E6E5C",
    marginBottom: 12,
  },
  dateRow: {
    gap: 10,
    paddingRight: 4,
    marginBottom: 4,
  },
  dateCard: {
    width: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    backgroundColor: "#FFFFFF",
    height: 92,
    alignItems: "center",
  },
  dateCardActive: {
    backgroundColor: "#0E6E5C",
  },
  dateDay: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#6F7975",
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#191C1C",
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#6F7975",
  },
  dateTextActive: { color: "#FFFFFF" },
  timeList: { gap: 10, marginBottom: 12 },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    padding: 14,
    minHeight: 70,
  },
  timeCardSelected: {
    borderColor: "#0E6E5C",
    backgroundColor: "#C8EADF66",
    borderWidth: 2,
  },
  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  timeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2F4F3",
    alignItems: "center",
    justifyContent: "center",
  },
  timeIconBoxSelected: {
    backgroundColor: ACTIVE_BG,
  },
  timeIcon: { width: 19, height: 14 },
  timeTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6F7975",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: ACCENT,
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    padding: 14,
    gap: 12,
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: ACTIVE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  addressIcon: { width: 19, height: 14, tintColor: ACCENT },

  addressCopy: { flex: 1 },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  changeLink: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: ACCENT,
  },
  addressLine: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6F7975",
    lineHeight: 19,
    paddingRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "transparent",
  },
  continueBtn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: { color: "#fff", fontSize: 16, fontFamily: fonts.bold },
});
