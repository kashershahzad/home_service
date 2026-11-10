import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { bookingApi, getToken } from "../utils/api";
import {
  extractBookingsList,
  mapBookingToCard,
} from "../utils/bookingsList";

const COLORS = {
  primary: "#7310FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const HISTORY_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"];

const STATUS_STYLES = {
  Upcoming: { bg: "#F1E7FF", color: "#7310FF" },
  Completed: { bg: "#E6FBEF", color: "#2ECC71" },
  Cancelled: { bg: "#FFECEC", color: "#FF3B30" },
};

export default function BookingsHistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setBookings([]);
        setError("Please sign in to see bookings.");
        return;
      }

      // Postman 08 — list all + past (history). Merge for filters.
      const [allRes, pastRes, upcomingRes] = await Promise.all([
        bookingApi.list(token).catch(() => null),
        bookingApi.list(token, "past").catch(() => null),
        bookingApi.list(token, "upcoming").catch(() => null),
      ]);

      const byId = new Map();
      [
        ...extractBookingsList(allRes),
        ...extractBookingsList(pastRes),
        ...extractBookingsList(upcomingRes),
      ].forEach((b) => {
        const card = mapBookingToCard(b);
        if (card.id) byId.set(card.id, card);
      });

      // Enrich location from raw address if present
      const list = Array.from(byId.values()).map((card) => {
        const addr = card.raw?.address;
        const location = addr
          ? [addr.line, addr.area, addr.city].filter(Boolean).join(", ")
          : card.location || "";
        return { ...card, location };
      });

      setBookings(list);
    } catch (err) {
      setError(err?.message || "Could not load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  const filtered = useMemo(() => {
    if (activeFilter === "All") return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [activeFilter, bookings]);

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
        {loading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginTop: 30 }}
          />
        ) : error ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={loadBookings} hitSlop={HIT_SLOP}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
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
                      reference: item.reference || "",
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
                        style={[
                          styles.statusText,
                          { color: statusStyle.color },
                        ]}
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
                      {[item.date, item.time].filter(Boolean).join(" · ")}
                    </Text>
                  </View>

                  {item.location ? (
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
                  ) : null}

                  <Text style={styles.price}>
                    Rs.{Number(item.price || 0).toLocaleString("en-PK")}
                  </Text>
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
    paddingHorizontal: 16,
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
    fontSize: 20,
    color: COLORS.text,
  },
  filterScroll: { flexGrow: 0 },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.subtext,
  },
  filterChipTextActive: { color: "#fff" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyWrap: { alignItems: "center", marginTop: 24, gap: 8 },
  emptyText: {
    textAlign: "center",
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 24,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 12,
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
  statusText: { fontSize: 11, fontWeight: "700" },
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
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
