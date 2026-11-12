import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "../assets/images/image";
import fonts from "../components/assets/fonts";
import BottomTabBar from "../components/components/BottomTabBar";
import CustomText from "../components/components/CustomText";
import Icons from "../components/components/Icons";
import { bookingApi, getToken } from "../utils/api";
import {
  extractBookingsList,
  formatMoney,
  mapBookingToCard,
} from "../utils/bookingsList";

const COLORS = {
  primary: "#0E6E4C",
  primarySoft: "#E8F5EF",
  bg: "#FFFFFF",
  card: "#FFFFFF",
  nested: "#EEF6FB",
  text: "#111827",
  muted: "#8A948F",
  border: "#E8ECEA",
  completedBg: "#9FF4C9",
  completedText: "#005236",
  cancelledBg: "#FDECEC",
  cancelledText: "#E11D48",
  star: "#F5B400",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };
const FILTERS = ["All", "Booked", "Completed", "Cancelled"];

const DEMO_BOOKINGS = [
  {
    id: "demo-active",
    reference: "HS-92841",
    title: "Signature Haircut & Blowout",
    provider: "Ayesha Khan",
    providerImage: null,
    providerRating: "4.9",
    providerJobs: "240+ services",
    providerBadge: "Certified Master",
    date: "Today",
    dateISO: "",
    time: "2:30 PM",
    durationLabel: "60 mins",
    scheduleWithDuration: "Today, 2:30 PM • 60 mins",
    price: 65,
    status: "Booked",
    paymentLabel: "Paid online",
    reviewScore: null,
    reviewText: null,
    cancelReason: "",
    image: "",
  },
  {
    id: "demo-completed",
    reference: "HS-90112",
    title: "Standard Eco Home Sanitization",
    provider: "Sarah Ahmed",
    providerImage: null,
    providerRating: "4.9",
    providerJobs: "180+ services",
    providerBadge: "Top Pro",
    date: "Yesterday, Oct 15",
    dateISO: "",
    time: "",
    durationLabel: null,
    scheduleWithDuration: "Yesterday, Oct 15",
    price: 85,
    status: "Completed",
    paymentLabel: "Paid in full",
    reviewScore: 5,
    reviewText: "Spotless kitchen!",
    cancelReason: "",
    image: "",
  },
  {
    id: "demo-cancelled",
    reference: "HS-81204",
    title: "Express Balayage & Thermal Touch-up",
    provider: "Ayesha Khan",
    providerImage: null,
    providerRating: "4.9",
    providerJobs: "240+ services",
    providerBadge: "Certified Master",
    date: "Oct 10",
    dateISO: "",
    time: "4:00 PM",
    durationLabel: null,
    scheduleWithDuration: "Oct 10, 4:00 PM",
    price: 80,
    status: "Cancelled",
    paymentLabel: "Refunded",
    reviewScore: null,
    reviewText: null,
    cancelReason: "Client Schedule Conflict (Cancelled >4h prior)",
    image: "",
  },
];

function StatusPill({ status }) {
  if (status === "Completed") {
    return (
      <View style={[styles.pill, { backgroundColor: COLORS.completedBg }]}>
        <Icons
          family="Ionicons"
          name="checkmark-circle"
          size={13}
          color={COLORS.completedText}
        />
        <CustomText
          label="Completed"
          removeTranslation
          fontSize={12}
          fontFamily={fonts.semiBold}
          color={COLORS.completedText}
          marginLeft={5}
        />
      </View>
    );
  }

  if (status === "Cancelled") {
    return (
      <View style={[styles.pill, { backgroundColor: COLORS.cancelledBg }]}>
        <Icons
          family="Ionicons"
          name="close-circle"
          size={13}
          color={COLORS.cancelledText}
        />
        <CustomText
          label="Cancelled & Fully Refunded"
          removeTranslation
          fontSize={12}
          fontFamily={fonts.semiBold}
          color={COLORS.cancelledText}
          marginLeft={5}
        />
      </View>
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: COLORS.primary }]}>
      <Icons family="Ionicons" name="sync" size={12} color="#FFFFFF" />
      <CustomText
        label="Active"
        removeTranslation
        fontSize={12}
        fontFamily={fonts.semiBold}
        color="#FFFFFF"
        marginLeft={5}
      />
    </View>
  );
}

function Stars({ score = 5 }) {
  const filled = Math.max(0, Math.min(5, Math.round(Number(score) || 0)));
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icons
          key={i}
          family="Ionicons"
          name={i < filled ? "star" : "star-outline"}
          size={13}
          color={COLORS.star}
        />
      ))}
    </View>
  );
}

function BookingCard({ item, onPress }) {
  const avatarSource = item.providerImage
    ? { uri: item.providerImage }
    : images.homecard1;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <StatusPill status={item.status} />

      <View style={styles.titleRow}>
        <CustomText
          label={item.title}
          removeTranslation
          fontSize={18}
          fontFamily={fonts.bold}
          color={COLORS.text}
          containerStyle={styles.titleFlex}
          numberOfLines={2}
        />
        <View style={styles.priceCol}>
          {item.status === "Cancelled" ? (
            <>
              <CustomText
                label={formatMoney(item.price)}
                removeTranslation
                fontSize={15}
                fontFamily={fonts.semiBold}
                color={COLORS.muted}
                textDecorationLine="line-through"
                textAlign="right"
              />
              <CustomText
                label="$0.00 Net"
                removeTranslation
                fontSize={13}
                fontFamily={fonts.bold}
                color={COLORS.cancelledText}
                textAlign="right"
                marginTop={2}
              />
            </>
          ) : (
            <>
              <CustomText
                label={formatMoney(item.price)}
                removeTranslation
                fontSize={18}
                fontFamily={fonts.extraBold}
                color={COLORS.text}
                textAlign="right"
              />
              {item.paymentLabel ? (
                <CustomText
                  label={item.paymentLabel}
                  removeTranslation
                  fontSize={11}
                  fontFamily={fonts.semiBold}
                  color={
                    item.status === "Completed" ? COLORS.primary : COLORS.muted
                  }
                  textAlign="right"
                  marginTop={2}
                />
              ) : null}
            </>
          )}
        </View>
      </View>

      {item.status === "Booked" ? (
        <>
          <View style={styles.metaRow}>
            <Icons
              family="Ionicons"
              name="time-outline"
              size={15}
              color={COLORS.primary}
            />
            <CustomText
              label={item.scheduleWithDuration}
              removeTranslation
              fontSize={13}
              fontFamily={fonts.medium}
              color={COLORS.muted}
              marginLeft={6}
            />
          </View>

          {item.hasAssignee && item.provider ? (
            <View style={styles.nested}>
              {item.providerImage ? (
                <Image source={avatarSource} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Icons
                    family="Ionicons"
                    name="person-outline"
                    size={20}
                    color={COLORS.muted}
                  />
                </View>
              )}
              <View style={styles.nestedCopy}>
                <View style={styles.nameRow}>
                  <CustomText
                    label={item.provider}
                    removeTranslation
                    fontSize={14}
                    fontFamily={fonts.bold}
                    color={COLORS.text}
                    numberOfLines={1}
                    containerStyle={{ flexShrink: 1 }}
                  />
                  <View style={{ marginLeft: 4 }}>
                    <Icons
                      family="Ionicons"
                      name="checkmark-circle"
                      size={14}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
                {item.providerRating ? (
                  <View style={styles.ratingRow}>
                    <Icons
                      family="Ionicons"
                      name="star"
                      size={12}
                      color={COLORS.star}
                    />
                    <CustomText
                      label={
                        item.providerJobs
                          ? `${item.providerRating} • ${item.providerJobs}`
                          : item.providerRating
                      }
                      removeTranslation
                      fontSize={12}
                      fontFamily={fonts.medium}
                      color={COLORS.muted}
                      marginLeft={4}
                    />
                  </View>
                ) : null}
              </View>
              {item.providerBadge ? (
                <View style={styles.badge}>
                  <CustomText
                    label={item.providerBadge}
                    removeTranslation
                    fontSize={10}
                    fontFamily={fonts.semiBold}
                    color={COLORS.primary}
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.nested}>
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icons
                  family="Ionicons"
                  name="person-outline"
                  size={20}
                  color={COLORS.muted}
                />
              </View>
              <View style={styles.nestedCopy}>
                <CustomText
                  label="Not assigned yet"
                  removeTranslation
                  fontSize={14}
                  fontFamily={fonts.semiBold}
                  color={COLORS.muted}
                />
              </View>
            </View>
          )}
        </>
      ) : null}

      {item.status === "Completed" ? (
        <>
          <CustomText
            label={`${item.date || item.scheduleWithDuration}${
              item.hasAssignee && item.provider
                ? ` • Completed by ${item.provider}`
                : ""
            }`}
            removeTranslation
            fontSize={13}
            fontFamily={fonts.medium}
            color={COLORS.muted}
            marginTop={10}
          />
          {!item.hasAssignee ? (
            <View style={styles.nested}>
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icons
                  family="Ionicons"
                  name="person-outline"
                  size={20}
                  color={COLORS.muted}
                />
              </View>
              <View style={styles.nestedCopy}>
                <CustomText
                  label="Not assigned yet"
                  removeTranslation
                  fontSize={14}
                  fontFamily={fonts.semiBold}
                  color={COLORS.muted}
                />
              </View>
            </View>
          ) : null}
          {item.reviewScore != null ? (
            <View style={[styles.nested, styles.nestedCompleted]}>
              <Stars score={item.reviewScore} />
              <CustomText
                label={`${Number(item.reviewScore).toFixed(1)}${
                  item.reviewText ? `  '${item.reviewText}'` : ""
                }`}
                removeTranslation
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={COLORS.text}
                marginLeft={8}
                containerStyle={{ flex: 1 }}
                numberOfLines={1}
              />
              <CustomText
                label="Rated"
                removeTranslation
                fontSize={12}
                fontFamily={fonts.bold}
                color={COLORS.primary}
                marginLeft={8}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {item.status === "Cancelled" ? (
        <>
          <CustomText
            label={`Ref: #${String(item.reference).replace(/^#/, "")} • Originally: ${
              item.scheduleWithDuration ||
              [item.date, item.time].filter(Boolean).join(", ")
            }`}
            removeTranslation
            fontSize={12}
            fontFamily={fonts.medium}
            color={COLORS.muted}
            marginTop={10}
          />
          <View style={[styles.nested, styles.nestedCancelled]}>
            <Icons
              family="Ionicons"
              name="information-circle"
              size={16}
              color={COLORS.muted}
            />
            <CustomText
              label={`Reason: ${item.cancelReason}`}
              removeTranslation
              fontSize={12}
              fontFamily={fonts.medium}
              color={COLORS.muted}
              marginLeft={8}
              containerStyle={{ flex: 1 }}
              lineHeight={17}
            />
          </View>
        </>
      ) : null}
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        setBookings(DEMO_BOOKINGS);
        return;
      }

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

      const list = Array.from(byId.values());
      setBookings(list.length === 0 ? DEMO_BOOKINGS : list);
    } catch (err) {
      setError(err?.message || "Could not load bookings");
      setBookings(DEMO_BOOKINGS);
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
    if (activeFilter === "Booked") {
      // Booked tab = assigned active jobs only (not matching / unassigned)
      return bookings.filter(
        (b) => b.status === "Booked" && !!b.hasAssignee,
      );
    }
    return bookings.filter((b) => b.status === activeFilter);
  }, [activeFilter, bookings]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/home");
          }}
        >
          <Icons
            family="Ionicons"
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <CustomText
          label="Booking"
          removeTranslation
          fontSize={18}
          fontFamily={fonts.bold}
          color={COLORS.text}
        />
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => {
          const active = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, active && styles.filterChipActive]}
              activeOpacity={0.85}
              onPress={() => setActiveFilter(filter)}
            >
              <CustomText
                label={filter}
                removeTranslation
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={active ? "#FFFFFF" : COLORS.text}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {loading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginVertical: 28 }}
          />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <CustomText
              label={error || "No bookings in this filter."}
              removeTranslation
              fontSize={13}
              fontFamily={fonts.medium}
              color={COLORS.muted}
              textAlign="center"
            />
            <TouchableOpacity onPress={loadBookings} hitSlop={HIT_SLOP}>
              <CustomText
                label="Retry"
                removeTranslation
                fontSize={13}
                fontFamily={fonts.bold}
                color={COLORS.primary}
                marginTop={8}
                textAlign="center"
              />
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item) => (
            <BookingCard
              key={item.id}
              item={item}
              onPress={() => {
                if (!item?.id) return;
                router.push({
                  pathname: "/booking-view",
                  params: { id: String(item.id) },
                });
              }}
            />
          ))
        )}
      </ScrollView>

      <BottomTabBar active="bookings" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
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
  filters: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#D7DEDA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 4,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    backgroundColor: COLORS.card,
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  titleFlex: {
    flex: 1,
  },
  priceCol: {
    alignItems: "flex-end",
    minWidth: 78,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  nested: {
    marginTop: 14,
    backgroundColor: COLORS.nested,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  nestedCompleted: {
    paddingVertical: 12,
  },
  nestedCancelled: {
    alignItems: "flex-start",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    backgroundColor: "#D8E4DE",
    alignItems: "center",
    justifyContent: "center",
  },
  nestedCopy: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
});
