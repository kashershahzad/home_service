import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7310FF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const HISTORY_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];

const BOOKINGS_HISTORY = [
  {
    id: "h1",
    title: "House Cleaning",
    provider: "Kylee Danford",
    date: "Dec 22, 2026",
    dateISO: "2026-12-22",
    time: "10:00 AM",
    workingHours: "2",
    promoCode: "Discount 30% off",
    price: 2500,
    status: "Upcoming",
    location: "255 Grand Park Avenue, Lahore",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format",
  },
  {
    id: "h2",
    title: "Wall Painting",
    provider: "Sanjeenta",
    date: "Dec 20, 2026",
    dateISO: "2026-12-20",
    time: "01:00 PM",
    workingHours: "4",
    promoCode: "",
    price: 3000,
    status: "Upcoming",
    location: "12 Gulberg III, Lahore",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80&auto=format",
  },
  {
    id: "h3",
    title: "AC Repair",
    provider: "Cool Air Services",
    date: "Dec 18, 2026",
    dateISO: "2026-12-18",
    time: "02:00 PM",
    workingHours: "1",
    promoCode: "",
    price: 2600,
    status: "Completed",
    location: "Model Town Block A, Lahore",
    image:
      "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&q=80&auto=format",
  },
  {
    id: "h4",
    title: "Washing Clothes",
    provider: "Rehan Malik",
    date: "Dec 15, 2026",
    dateISO: "2026-12-15",
    time: "09:00 AM",
    workingHours: "2",
    promoCode: "",
    price: 1200,
    status: "Completed",
    location: "Johar Town, Lahore",
    image:
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&q=80&auto=format",
  },
  {
    id: "h5",
    title: "Pipe Fitting",
    provider: "Hamza Tariq",
    date: "Dec 10, 2026",
    dateISO: "2026-12-10",
    time: "11:00 AM",
    workingHours: "3",
    promoCode: "",
    price: 1500,
    status: "Cancelled",
    location: "DHA Phase 5, Lahore",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format",
  },
  {
    id: "h6",
    title: "Home Shifting",
    provider: "Faizan Shifting Co.",
    date: "Dec 05, 2026",
    dateISO: "2026-12-05",
    time: "08:00 AM",
    workingHours: "5",
    promoCode: "",
    price: 5000,
    status: "Cancelled",
    location: "Bahria Town, Lahore",
    image:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&q=80&auto=format",
  },
];

const STATUS_STYLES = {
  Upcoming: { bg: "#F1E7FF", color: "#7310FF" },
  Completed: { bg: "#E6FBEF", color: "#2ECC71" },
  Cancelled: { bg: "#FFECEC", color: "#FF3B30" },
};

export default function BookingsHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? BOOKINGS_HISTORY
      : BOOKINGS_HISTORY.filter((b) => b.status === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/profile");
          }}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings History</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {HISTORY_FILTERS.map((filter) => {
          const active = filter === activeFilter;
          return (
            <TouchableOpacity
              key={filter}
              hitSlop={HIT_SLOP}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No bookings found.</Text>
        ) : (
          filtered.map((item) => {
            const statusStyle =
              STATUS_STYLES[item.status] || STATUS_STYLES.Upcoming;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/booking-details",
                    params: {
                      id: item.id,
                      title: item.title,
                      name: item.provider,
                      price: String(item.price),
                      image: item.image,
                      status: item.status,
                      date: item.dateISO,
                      dateLabel: item.date,
                      startTime: item.time,
                      workingHours: item.workingHours,
                      promoCode: item.promoCode || "",
                      mode: "view",
                    },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusStyle.color }]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.provider}>{item.provider}</Text>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color={COLORS.subtext}
                    />
                    <Text style={styles.metaText}>
                      {item.date} · {item.time}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.subtext}
                    />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>

                  <Text style={styles.price}>Rs.{item.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 22,
    color: COLORS.text,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.primary,
  },
  filterChipTextActive: { color: "#fff" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: 14,
    marginRight: 12,
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  provider: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.subtext,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 6,
  },
});
