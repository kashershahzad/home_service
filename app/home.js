import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { images } from "../assets/images/image";
import fonts from "../components/assets/fonts";
import BookAgainCard from "../components/components/BookAgainCard";
import BottomTabBar from "../components/components/BottomTabBar";
import CustomText from "../components/components/CustomText";
import LimitedOfferCard from "../components/components/LimitedOfferCard";
import PopularServiceCard from "../components/components/PopularServiceCard";
import ScreenWrapper from "../components/components/ScreenWrapper";
import { POPULAR_SERVICES } from "../constants/popularServices";
import { catalogApi, getToken, homeApi } from "../utils/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const H_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

/** Postman sample — Lahore Area 1 (hair + cleaning) */
const DEFAULT_COORDS = { lat: 31.52, lng: 74.35 };
const HOME_CACHE_MS = 60 * 1000;

const CATEGORY_ICONS = {
  "home-cleaning": images.cleaning2,
  cleaning: images.cleaning2,
  "hair-dressing": images.hair,
  hair: images.hair,
  "makeup-beauty": images.flower,
  beauty: images.flower,
  laundry: images.laundryIcon,
};

const FALLBACK_IMAGES = [
  images.homecard1,
  images.homecard2,
  images.homecard3,
  images.homecard4,
];

function categoryIconFor(slugOrName = "") {
  const key = String(slugOrName).toLowerCase();
  return CATEGORY_ICONS[key] || images.moreIcon;
}

function mapCatalogCategories(list = []) {
  return list.map((c, index) => {
    const slug = c.slug || c.id || c.name || `cat-${index}`;
    const label = c.name || c.title || c.label || slug;
    return {
      id: String(slug),
      slug: String(slug),
      label: String(label),
      bookingFlow: c.bookingFlow || null,
      icon: categoryIconFor(slug) || categoryIconFor(label),
      raw: c,
    };
  });
}

/** Existing booking UIs — do not open /category list. */
function getBookingPath(slug, bookingFlow) {
  const s = String(slug || "").toLowerCase();
  const flow = String(bookingFlow || "").toLowerCase();
  if (s === "home-cleaning" || flow === "property" || s.includes("clean")) {
    return "/booking/propertyBooking";
  }
  if (s === "hair-dressing" || s.includes("hair") || s.includes("salon")) {
    return {
      pathname: "/booking/bookHaircutService",
      params: { categorySlug: "hair-dressing" },
    };
  }
  // Other package-style categories still use cleaning wizard until their UI exists
  return "/booking/propertyBooking";
}

function mapHomeCategories(list = []) {
  return mapCatalogCategories(list);
}

function mapOffer(offer) {
  if (!offer) return null;
  const discount =
    offer.discountType === "percent" || offer.discountValue != null
      ? `${offer.discountValue ?? offer.percent ?? 0}% OFF`
      : offer.discount || offer.title || "Special Offer";
  return {
    discount,
    subtitle: offer.title || offer.description || offer.subtitle || "",
    code: offer.code,
    raw: offer,
  };
}

function mapBookAgain(item, index = 0) {
  if (!item) return null;
  const name =
    item.professionalName ||
    item.name ||
    item.providerName ||
    item.professional?.name ||
    "Professional";
  const initials = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "HS";

  return {
    id: String(item.id || item._id || index),
    initials,
    name,
    rating: item.rating ?? item.professional?.rating ?? 5,
    service: item.serviceTitle || item.service || item.categoryName || item.title || "Service",
    status: item.status || "Completed",
    date: item.date || item.completedAt || item.schedule?.date || "",
    raw: item,
  };
}

function mapPopularFromCategories(categories = []) {
  return categories.map((c, index) => ({
    id: c.slug || c.id || `svc-${index}`,
    title: c.name || c.title || c.label || c.slug,
    name: c.name || c.title || "Service",
    price: c.startingPrice ?? c.price ?? "—",
    rating: c.rating ?? 4.8,
    tag: c.tag || "Available",
    tagColor: "popular",
    image: c.imageUrl || c.image ? { uri: c.imageUrl || c.image } : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    slug: c.slug || c.id,
    bookingFlow: c.bookingFlow || null,
  }));
}

const home = () => {
  const router = useRouter();
  const user = useSelector((state) => state.users.userData);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [locationLabel, setLocationLabel] = useState("Lahore");
  const [greeting, setGreeting] = useState("");
  const [categories, setCategories] = useState([
    { id: "all", label: "All Services", slug: "all", icon: null },
  ]);
  const [offers, setOffers] = useState([]);
  const [bookAgain, setBookAgain] = useState([]);
  const [popular, setPopular] = useState(POPULAR_SERVICES);

  const lastFetchAt = useRef(0);
  const inFlight = useRef(false);

  const displayName =
    user?.nickname || user?.fullName?.split(" ")?.[0] || "there";

  const greetingText = useMemo(() => {
    if (greeting) return greeting;
    return `Assalam o Alaikum, ${displayName} 👋`;
  }, [greeting, displayName]);

  const resolveLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return { ...DEFAULT_COORDS, label: "Lahore (default)" };
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let label = "Current location";
      try {
        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const p = places?.[0];
        if (p) {
          label = [p.district || p.subregion, p.city || p.region]
            .filter(Boolean)
            .join(", ") || label;
        }
      } catch (_) {}
      return { lat, lng, label };
    } catch {
      return { ...DEFAULT_COORDS, label: "Lahore (default)" };
    }
  }, []);

  const loadHomeData = useCallback(
    async ({ force = false } = {}) => {
      if (inFlight.current) return;
      const now = Date.now();
      if (!force && lastFetchAt.current && now - lastFetchAt.current < HOME_CACHE_MS) {
        setLoading(false);
        return;
      }

      inFlight.current = true;
      setLoading(true);
      try {
        const loc = await resolveLocation();
        setCoords({ lat: loc.lat, lng: loc.lng });
        setLocationLabel(loc.label);

        const token = await getToken();

        const [homeRes, catalogRes] = await Promise.all([
          token
            ? homeApi.getHome(loc.lat, loc.lng, token).catch((err) => {
                console.log("[home] GET /home failed:", err?.message || err);
                return null;
              })
            : Promise.resolve(null),
          catalogApi.getCategories(loc.lat, loc.lng).catch((err) => {
            console.log("[home] GET /catalog/categories failed:", err?.message || err);
            return null;
          }),
        ]);

        // Categories: prefer catalog (location zones), fallback to home.categories
        const catalogCats = mapCatalogCategories(
          catalogRes?.categories || catalogRes?.data || [],
        );
        const homeCats = mapHomeCategories(
          homeRes?.categories || homeRes?.data?.categories || [],
        );
        const mergedCats = catalogCats.length ? catalogCats : homeCats;
        setCategories([
          { id: "all", label: "All Services", slug: "all", icon: null },
          ...mergedCats,
        ]);

        if (homeRes) {
          if (typeof homeRes.greeting === "string" && homeRes.greeting.trim()) {
            setGreeting(homeRes.greeting);
          }

          const offerList = Array.isArray(homeRes.offers)
            ? homeRes.offers
            : homeRes.offer
              ? [homeRes.offer]
              : [];
          setOffers(offerList.map(mapOffer).filter(Boolean));

          const againRaw = homeRes.bookAgain;
          const againList = Array.isArray(againRaw)
            ? againRaw
            : againRaw
              ? [againRaw]
              : [];
          setBookAgain(againList.map(mapBookAgain).filter(Boolean));

          const popularRaw =
            homeRes.popularServices ||
            homeRes.popular ||
            homeRes.services ||
            [];
          if (Array.isArray(popularRaw) && popularRaw.length) {
            setPopular(
              popularRaw.map((item, index) => ({
                id: item.id || item._id || `p-${index}`,
                title: item.title || item.name || "Service",
                name: item.name || item.providerName || item.title || "Service",
                price: item.price ?? item.startingPrice ?? "—",
                rating: item.rating ?? 4.8,
                tag: item.tag || "Popular",
                tagColor: item.tagColor || "popular",
                image: item.image || item.imageUrl
                  ? { uri: item.image || item.imageUrl }
                  : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
                slug: item.slug || item.categorySlug,
              })),
            );
          } else if (mergedCats.length) {
            setPopular(mapPopularFromCategories(mergedCats.map((c) => c.raw || c)));
          }
        } else if (mergedCats.length) {
          setPopular(mapPopularFromCategories(mergedCats.map((c) => c.raw || c)));
        }

        lastFetchAt.current = Date.now();
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [resolveLocation],
  );

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  const filteredPopular = useMemo(() => {
    if (selectedCategory === "all") return popular;
    return popular.filter((item) => {
      const slug = String(item.slug || item.id || "").toLowerCase();
      const title = String(item.title || item.name || "").toLowerCase();
      const selected = String(selectedCategory).toLowerCase();
      return slug.includes(selected) || title.includes(selected.replace(/-/g, " "));
    });
  }, [popular, selectedCategory]);

  const activeOffer = offers[0] || null;

  const openServiceBooking = (item) => {
    const target = getBookingPath(item?.slug || item?.id, item?.bookingFlow);
    router.push(target);
  };

  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setSelectedCategory(item.id);
          // All Services = filter only. Specific service = existing booking flow.
          if (item.slug && item.slug !== "all") {
            openServiceBooking(item);
          }
        }}
        style={[
          styles.categoryChip,
          isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
        ]}
      >
        {item.icon ? (
          <Image
            source={item.icon}
            style={[
              styles.categoryIcon,
              isSelected && styles.categoryIconActive,
            ]}
          />
        ) : null}
        <CustomText
          label={item.label}
          fontSize={12}
          fontFamily={fonts.semiBold}
          color={isSelected ? "#FFFFFF" : "#455D55"}
        />
      </TouchableOpacity>
    );
  };

  const renderPopularService = ({ item }) => (
    <PopularServiceCard
      item={{
        ...item,
        price:
          item.price === "—" || item.price == null
            ? "—"
            : Number(item.price).toLocaleString("en-PK"),
      }}
      style={{ width: CARD_WIDTH }}
      onPress={() => openServiceBooking(item)}
    />
  );

  return (
    <ScreenWrapper
      backgroundColor="#F6FAF8"
      paddingHorizontal={0}
      scrollEnabled
      paddingBottom={0}
      footerUnScrollable={() => <BottomTabBar active="home" />}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.locationContainer}
          onPress={() => loadHomeData({ force: true })}
        >
          <Image
            source={images.locationIcon}
            style={{ width: 11, height: 14 }}
          />
          <CustomText
            label={locationLabel}
            fontSize={12}
            fontFamily={fonts.bold}
          />
          <Image source={images.downarrow} style={{ width: 7, height: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => router.push("/notifications")}
        >
          <Image
            source={images.notificationIcon}
            style={{ width: 12, height: 15 }}
          />
          <Image
            source={images.activeNotificationIcon}
            style={{
              width: 8,
              height: 8,
              position: "absolute",
              right: 10,
              top: 9,
            }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentPadding}>
        <CustomText
          label={greetingText}
          fontSize={20}
          fontFamily={fonts.extraBold}
          color={"#14332C"}
          marginTop={10}
        />
        <CustomText
          label="What service do you need today?"
          fontSize={13}
          fontFamily={fonts.medium}
          color={"#526B63"}
          marginTop={5}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          color="#0E6E4C"
          style={{ marginTop: 28, marginBottom: 10 }}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategory}
          contentContainerStyle={styles.categoryList}
          style={styles.categoryListContainer}
        />
      )}

      <View style={styles.sectionHeader}>
        <CustomText
          label="Popular Services"
          fontSize={15}
          fontFamily={fonts.extraBold}
          color="#14332C"
        />
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.viewAllRow}
          onPress={() => router.push("/popular-services")}
        >
          <CustomText
            label="View all"
            fontSize={12}
            fontFamily={fonts.bold}
            color="#0E6E4C"
          />
          <Image source={images.rightarrow} style={styles.rightArrow} />
        </TouchableOpacity>
      </View>

      {!loading && filteredPopular.length === 0 ? (
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <CustomText
            label="No services available in your area yet."
            fontSize={13}
            fontFamily={fonts.medium}
            color="#668178"
          />
        </View>
      ) : (
        <FlatList
          data={filteredPopular}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          scrollEnabled={false}
          renderItem={renderPopularService}
          columnWrapperStyle={styles.cardRow}
          contentContainerStyle={styles.cardList}
        />
      )}

      {activeOffer ? (
        <View style={styles.offerWrap}>
          <LimitedOfferCard
            discount={activeOffer.discount}
            subtitle={activeOffer.subtitle}
            buttonLabel="Claim Offer"
            onPress={() => router.push("/special-offers")}
          />
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <CustomText
          label="Book Again"
          fontSize={15}
          fontFamily={fonts.extraBold}
          color="#14332C"
        />
        <TouchableOpacity activeOpacity={0.7} style={styles.viewAllRow}>
          <CustomText
            label="Recent Activity"
            fontSize={12}
            fontFamily={fonts.bold}
            color="#668178"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bookAgainList}>
        {bookAgain.length === 0 ? (
          <CustomText
            label="No past bookings yet."
            fontSize={13}
            fontFamily={fonts.medium}
            color="#668178"
          />
        ) : (
          bookAgain.map((item) => (
            <BookAgainCard key={item.id} item={item} />
          ))
        )}
      </View>
    </ScreenWrapper>
  );
};

export default home;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 16,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    padding: 10,
    borderWidth: 1,
    borderColor: "#064E3B1A",
    maxWidth: "75%",
  },
  notificationContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    height: 36,
    width: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#064E3B1A",
  },
  categoryListContainer: {
    marginTop: 30,
    flexGrow: 0,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  categoryChipActive: {
    backgroundColor: "#064E3B",
  },
  categoryChipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#064E3B1A",
  },
  categoryIcon: {
    width: 11,
    height: 13,
    resizeMode: "contain",
  },
  categoryIconActive: {
    tintColor: "#FFFFFF",
  },
  offerWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  bookAgainList: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
    paddingBottom: 20,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rightArrow: {
    width: 4,
    height: 7,
    resizeMode: "contain",
    marginTop: 2,
  },
  cardList: {
    paddingHorizontal: H_PADDING,
    paddingTop: 14,
  },
  cardRow: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
});
