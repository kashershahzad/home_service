<<<<<<< HEAD
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { images } from '../assets/images/image';
import { OFFERS } from '../constants/offers';
import { useBookmarks } from '../context/BookmarkContext';
import { authApi, getToken, serviceApi } from '../utils/api';

const COLORS = {
  primary: '#7310FF',
  pink: '#FF6FA5',
  bg: '#FAFAFA',
  card: '#F5F5F5',
  text: '#000000',
  subtext: '#6B6B6B',
  chipBg: '#F1E7FF',
  star: '#FFB800',
  lightGray: '#C3C3C3',
=======
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OFFERS } from "../constants/offers";
import { useBookmarks } from "../context/BookmarkContext";
import { authApi, getToken, serviceApi } from "../utils/api";

const COLORS = {
  primary: "#7310FF",
  pink: "#FF6FA5",
  bg: "#FAFAFA",
  card: "#F5F5F5",
  text: "#000000",
  subtext: "#6B6B6B",
  chipBg: "#F1E7FF",
  star: "#FFB800",
>>>>>>> dd086a0 (code .)
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const OFFER_CARD_WIDTH = SCREEN_WIDTH - 40;
const OFFER_CARD_SPACING = 16;

const SERVICES = [
<<<<<<< HEAD
  { id: '1', label: 'Cleaning', icon: images.cleaningIcon, bg: '#EFE7FF', color: '#8A5CF6' },
  { id: '2', label: 'Repairing', icon: images.repairingIcon, bg: '#FFE9EC', color: '#FF6F91' },
  { id: '3', label: 'Painting', icon: images.paintingIcon, bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '4', label: 'Laundry', icon: images.laundryIcon, bg: '#FFF6DE', color: '#F5B301' },
  { id: '5', label: 'Appliance', icon: images.applianceIcon, bg: '#FFE4EC', color: '#FF6F91' },
  { id: '6', label: 'Plumbing', icon: images.plumbingIcon, bg: '#E6FBEF', color: '#2ECC71' },
  { id: '7', label: 'Shifting', icon: images.shiftingIcon, bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '8', label: 'More', icon: images.moreSolidIcon, bg: '#F0EEFB', color: COLORS.primary },
=======
  {
    id: "1",
    label: "Cleaning",
    icon: "spray-bottle",
    bg: "#EFE7FF",
    color: "#8A5CF6",
  },
  {
    id: "2",
    label: "Repairing",
    icon: "tools",
    bg: "#FFE9EC",
    color: "#FF6F91",
  },
  {
    id: "3",
    label: "Painting",
    icon: "format-paint",
    bg: "#E4F6FF",
    color: "#3AAFFF",
  },
  {
    id: "4",
    label: "Laundry",
    icon: "washing-machine",
    bg: "#FFF6DE",
    color: "#F5B301",
  },
  {
    id: "5",
    label: "Appliance",
    icon: "fridge-outline",
    bg: "#FFE4EC",
    color: "#FF6F91",
  },
  {
    id: "6",
    label: "Plumbing",
    icon: "pipe-wrench",
    bg: "#E6FBEF",
    color: "#2ECC71",
  },
  {
    id: "7",
    label: "Shifting",
    icon: "truck-outline",
    bg: "#E4F6FF",
    color: "#3AAFFF",
  },
  {
    id: "8",
    label: "More",
    icon: "dots-horizontal",
    bg: "#F0EEFB",
    color: COLORS.primary,
  },
>>>>>>> dd086a0 (code .)
];

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [popularData, setPopularData] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    //  ais ma profile ari hain

    const loadProfile = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const profile = await authApi.getMe(token);
        if (!isMounted) return;

        const userData = profile?.user || profile;

        setUserAvatar(userData?.profileImageUrl || null);
        setUserName(userData?.nickname || userData?.fullName || "");
      } catch (err) {
        console.log("Could not load profile:", err?.message || err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // ais ma popular services ari hain

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const data = await serviceApi.getCategories();
        console.log("Categories:", data);
        if (isMounted) setCategories(["All", ...(data.categories || [])]);
      } catch (err) {
        console.log("Could not load categories:", err?.message || err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  //  ais ma services ari hain filter ho ka
  useEffect(() => {
    let isMounted = true;
    const loadPopular = async () => {
      setLoadingPopular(true);
      try {
        const data = await serviceApi.getPopular(activeFilter);
        console.log("Popular data:", data);
        if (isMounted) setPopularData(data.providers || []);
      } catch (err) {
        console.log("Could not load popular services:", err?.message || err);
      } finally {
        if (isMounted) setLoadingPopular(false);
      }
    };
    loadPopular();
    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  const onOfferScrollEnd = (e) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (OFFER_CARD_WIDTH + OFFER_CARD_SPACING),
    );
    setActiveOfferIndex(index);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
            )}
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.userName}>
                {loadingProfile ? "..." : userName || "User"}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={HIT_SLOP}
              onPress={() => router.push("/notifications")}
            >
<<<<<<< HEAD
              <Image source={images.notificationIcon} style={styles.notificationIcon} />
=======
              <Ionicons
                name="notifications-outline"
                size={26}
                color={COLORS.text}
              />
>>>>>>> dd086a0 (code .)
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={HIT_SLOP}
              onPress={() => router.push("/my-bookmark")}
            >
              <Image source={images.saveIcon} style={styles.saveIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => router.push("/search")}
        >
          <Feather name="search" size={18} color={COLORS.lightGray} />
          <Text style={styles.searchInput} numberOfLines={1}>
            Search
          </Text>
          <TouchableOpacity
            style={styles.filterIconBtn}
            hitSlop={HIT_SLOP}
            onPress={() =>
              router.push({ pathname: "/search", params: { openFilter: "1" } })
            }
          >
          <Image source={images.searchFilter} style={styles.searchIcon} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Special Offers */}
        <SectionHeader
          title="Special Offers"
          onSeeAll={() => router.push("/special-offers")}
        />

        <View style={styles.offerCarouselWrap}>
          <FlatList
            data={OFFERS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={OFFER_CARD_WIDTH + OFFER_CARD_SPACING}
            decelerationRate="fast"
            onMomentumScrollEnd={onOfferScrollEnd}
            style={{ marginHorizontal: -20 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.offerCard,
                  {
                    backgroundColor: item.bgColor,
                    marginRight: OFFER_CARD_SPACING,
                    width: OFFER_CARD_WIDTH,
                  },
                ]}
              >
                <View style={styles.offerTextWrap}>
                  <Text style={styles.offerPercent}>{item.percent}</Text>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerSubtitle}>{item.description}</Text>
                </View>
                <Image source={item.image} style={styles.offerImage} />
              </View>
            )}
          />

          <View style={styles.offerDotsRow} pointerEvents="none">
            {OFFERS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.offerDot,
                  i === activeOfferIndex && styles.offerDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Services */}
        <SectionHeader
          title="Services"
          onSeeAll={() => router.push("/all-services")}
        />
        <View style={styles.servicesGrid}>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.serviceItem}
              hitSlop={HIT_SLOP}
              onPress={() =>
                s.label === "More"
                  ? router.push("/all-services")
                  : router.push(`/category/${s.label}`)
              }
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: s.bg }]}>
<<<<<<< HEAD
                <Image source={s.icon} style={styles.serviceIcon} />
=======
                <MaterialCommunityIcons
                  name={s.icon}
                  size={22}
                  color={s.color}
                />
>>>>>>> dd086a0 (code .)
              </View>
              <Text style={styles.serviceLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <SectionHeader
          title="Most Popular Service"
          onSeeAll={() => router.push("/popular-services")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((f) => {
            const active = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                hitSlop={HIT_SLOP}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loadingPopular ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : popularData.length === 0 ? (
          <Text style={styles.emptyText}>
            Couldn't find any popular service in this category.
          </Text>
        ) : (
          <FlatList
            data={popularData.slice(0, 4)}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingTop: 6, paddingBottom: 110 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.popularCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/service/${item._id}`)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.popularImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.popularName}>{item.name}</Text>
                  <Text style={styles.popularTitle}>{item.title}</Text>
                  <Text style={styles.popularPrice}>Rs.{item.price}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={COLORS.star} />
                    <Text style={styles.ratingText}>
                      {item.rating} | {item.reviewsCount} reviews
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bookmarkBtn}
                  hitSlop={HIT_SLOP}
                  onPress={() => toggleBookmark(item)}
                >
<<<<<<< HEAD
              <Image source={ isBookmarked(item._id) ? images.savedIcon : images.saveIcon} style={styles.saveIcon} />

=======
                  <Ionicons
                    name={
                      isBookmarked(item._id) ? "bookmark" : "bookmark-outline"
                    }
                    size={20}
                    color={COLORS.primary}
                  />
>>>>>>> dd086a0 (code .)
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabIcon icon="home" label="Home" active />
        <TabIcon icon="list-outline" label="Bookings" />
        <TabIcon icon="calendar-outline" label="Calender" />
        <TabIcon
          icon="person-outline"
          label="Profile"
          onPress={() => router.push("/profile")}
        />
      </View>
    </View>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={HIT_SLOP}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabIcon({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      hitSlop={HIT_SLOP}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={24}
        color={active ? COLORS.primary : COLORS.subtext}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 45 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  avatarHead: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: "#B0B0B0",
    marginTop: 10,
  },
  avatarBody: {
    width: 37,
    height: 27,
    borderRadius: 18.5,
    backgroundColor: "#B0B0B0",
    marginTop: 3,
  },
  greeting: { fontSize: 13, color: COLORS.subtext },
  userName: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerRight: { flexDirection: "row" },
  iconBtn: {
    width: 38,
    height: 38,
<<<<<<< HEAD
    alignItems: 'center',
    justifyContent: 'center',
=======
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
>>>>>>> dd086a0 (code .)
  },
  notificationIcon: { width: 24, height: 24, resizeMode: 'contain', },
  saveIcon: { width: 24, height: 24, resizeMode: 'contain', },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DADADA4D",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 20,
  },
<<<<<<< HEAD
  searchInput: { flex: 1, fontSize: 14.5, color: COLORS.lightGray, marginLeft: 8 },
  filterIconBtn: { paddingLeft: 10, paddingVertical: 6, },
  searchIcon: { width: 18, height: 18, resizeMode: 'contain', },
=======
  searchInput: { flex: 1, fontSize: 14.5, color: COLORS.text, marginLeft: 8 },
  filterIconBtn: { paddingLeft: 10, paddingVertical: 6 },
>>>>>>> dd086a0 (code .)
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  offerCard: {
    flexDirection: "row",
    height: 160,
    borderRadius: 30,
    overflow: "hidden",
  },
  offerTextWrap: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 20,
    paddingVertical: 20,
  },
  offerPercent: { fontSize: 28, fontWeight: "800", color: "#fff" },
  offerTitle: { fontSize: 15, fontWeight: "700", color: "#fff", marginTop: 2 },
  offerSubtitle: { fontSize: 12, color: "#E6E1FF", marginTop: 6, width: "90%" },
  offerImage: { width: 160, height: 160, resizeMode: "cover" },
  offerCarouselWrap: { position: "relative" },
  offerDotsRow: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  offerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  offerDotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
  servicesGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 18 },
  divider: { height: 1, backgroundColor: "#D6D6D6", marginTop: 22 },
  serviceItem: { width: "25%", alignItems: "center" },
  serviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceLabel: { fontSize: 11.5, color: COLORS.text, fontWeight: "500" },
  filterScroll: {
    flexGrow: 0,
    marginTop: 4,
    marginBottom: 16,
  },
  serviceIcon: { width: 24, height: 24, resizeMode: 'contain', },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
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
    marginRight: 10,
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: { fontSize: 12.5, fontWeight: "600", color: COLORS.primary },
  filterChipTextActive: { color: "#fff" },
  emptyText: {
    textAlign: "center",
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 20,
    marginBottom: 40,
  },
  popularCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    minHeight: 116,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  popularImage: { width: 105, height: 105, borderRadius: 16, marginRight: 14 },
  popularName: { fontSize: 13, color: COLORS.subtext },
  popularTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 3,
  },
  popularPrice: {
    fontSize: 14.5,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 4,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ratingText: { fontSize: 11.5, color: COLORS.subtext, marginLeft: 4 },
<<<<<<< HEAD
  bookmarkBtn: { padding: 4, alignSelf: 'flex-start' },
  saveIcon: { width: 24, height: 24, resizeMode: 'contain', },
=======
  bookmarkBtn: { padding: 4, alignSelf: "flex-start" },
>>>>>>> dd086a0 (code .)
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
