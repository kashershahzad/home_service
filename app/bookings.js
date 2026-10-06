import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../assets/images/image";
import BottomTabBar from "../components/components/BottomTabBar";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  star: "#FFB800",
  border: "#EEEEEE",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const YOUR_BOOKINGS = [
  {
    id: "b1",
    title: "House Cleaning",
    provider: "Kylee Danford",
    date: "Dec 22, 2026",
    dateISO: "2026-12-22",
    time: "10:00 AM",
    workingHours: "2",
    promoCode: "Discount 30% off",
    price: 2500,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80&auto=format",
  },
  {
    id: "b2",
    title: "AC Repair",
    provider: "Cool Air Services",
    date: "Dec 18, 2026",
    dateISO: "2026-12-18",
    time: "02:00 PM",
    workingHours: "1",
    promoCode: "",
    price: 2600,
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&q=80&auto=format",
  },
  {
    id: "b3",
    title: "Pipe Fitting",
    provider: "Hamza Tariq",
    date: "Dec 10, 2026",
    dateISO: "2026-12-10",
    time: "11:00 AM",
    workingHours: "3",
    promoCode: "",
    price: 1500,
    status: "Cancelled",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format",
  },
];

const BOOK_SERVICES = [
  {
    id: "1",
    label: "Cleaning",
    icon: images.cleaningIcon,
    bg: "#EFE7FF",
  },
  {
    id: "2",
    label: "Repairing",
    icon: images.repairingIcon,
    bg: "#FFE9EC",
  },
  {
    id: "3",
    label: "Painting",
    icon: images.paintingIcon,
    bg: "#E4F6FF",
  },
  {
    id: "4",
    label: "Laundry",
    icon: images.laundryIcon,
    bg: "#FFF6DE",
  },
  {
    id: "5",
    label: "Appliance",
    icon: images.applianceIcon,
    bg: "#FFE4EC",
  },
  {
    id: "6",
    label: "Plumbing",
    icon: images.plumbingIcon,
    bg: "#E6FBEF",
  },
  {
    id: "7",
    label: "Shifting",
    icon: images.shiftingIcon,
    bg: "#E4F6FF",
  },
  {
    id: "8",
    label: "More",
    icon: images.moreSolidIcon,
    bg: "#F0EEFB",
  },
];

const STATUS_STYLES = {
  Upcoming: { bg: "#F1E7FF", color: "#7310FF" },
  Completed: { bg: "#E6FBEF", color: "#2ECC71" },
  Cancelled: { bg: "#FFECEC", color: "#FF3B30" },
};

export default function BookingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <TouchableOpacity style={styles.searchBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="search-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Bookings</Text>
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={() => router.push("/bookings-history")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {YOUR_BOOKINGS.length === 0 ? (
          <Text style={styles.emptyText}>No bookings yet.</Text>
        ) : (
          YOUR_BOOKINGS.map((item) => {
            const statusStyle =
              STATUS_STYLES[item.status] || STATUS_STYLES.Upcoming;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.bookingCard}
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
                <Image
                  source={{ uri: item.image }}
                  style={styles.bookingImage}
                />
                <View style={styles.bookingInfo}>
                  <View style={styles.bookingTopRow}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>
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
                  <Text style={styles.bookingProvider}>{item.provider}</Text>
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
                  <Text style={styles.bookingPrice}>Rs.{item.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Book Your Service */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <Text style={styles.sectionTitle}>Book Your Service</Text>
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={() => router.push("/all-services")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {BOOK_SERVICES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.serviceItem}
              hitSlop={HIT_SLOP}
              activeOpacity={0.8}
              onPress={() =>
                s.label === "More"
                  ? router.push("/all-services")
                  : router.push(`/category/${s.label}`)
              }
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: s.bg }]}>
                <Image source={s.icon} style={styles.serviceIcon} />
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar active="bookings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 24,
    color: COLORS.text,
  },
  searchBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 16,
    color: COLORS.text,
  },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: COLORS.subtext,
    fontSize: 13,
    marginVertical: 20,
  },
  bookingCard: {
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
  bookingImage: {
    width: 88,
    height: 88,
    borderRadius: 14,
    marginRight: 12,
  },
  bookingInfo: { flex: 1 },
  bookingTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bookingTitle: {
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
  bookingProvider: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 6,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 18,
  },
  serviceItem: { width: "25%", alignItems: "center" },
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  serviceIcon: { width: 24, height: 24, resizeMode: "contain" },
  serviceLabel: {
    fontSize: 11.5,
    color: COLORS.text,
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 5,
    fontWeight: "500",
  },
  tabLabelActive: { color: COLORS.primary, fontWeight: "700" },
});
