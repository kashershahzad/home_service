import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBookmarks } from "../context/BookmarkContext";
import { authApi, deleteToken, getToken } from "../utils/api";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#F0F0F0",
  danger: "#FF3B30",
  dangerSoft: "#FFECEC",
  star: "#FFB800",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const MENU_ITEMS = [
  {
    key: "bookmark",
    label: "My Bookmark",
    icon: "bookmark-outline",
    color: "#7310FF",
    bg: "#F1E7FF",
    route: "/my-bookmark",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    color: "#FF6F91",
    bg: "#FFE9EC",
    route: "/notifications",
  },
  {
    key: "offers",
    label: "Special Offers",
    icon: "pricetag-outline",
    color: "#F5B301",
    bg: "#FFF6DE",
    route: "/special-offers",
  },
  {
    key: "address",
    label: "Address & Location",
    icon: "location-outline",
    color: "#3AAFFF",
    bg: "#E4F6FF",
    route: "/address-location",
  },
  {
    key: "help",
    label: "Help Center",
    icon: "help-circle-outline",
    color: "#2ECC71",
    bg: "#E6FBEF",
    onPress: "help",
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: "shield-checkmark-outline",
    color: "#8A5CF6",
    bg: "#EFE7FF",
    onPress: "privacy",
  },
];

function MenuRow({ item, onPress, badge }) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
      <Feather name="chevron-right" size={18} color="#C4C4C4" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { refreshForUser, bookmarkedList } = useBookmarks();

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (mounted) setLoading(false);
          return;
        }
        const profile = await authApi.getMe(token);
        if (!mounted) return;
        setUser(profile?.user || profile);
      } catch (err) {
        console.log("Could not load profile:", err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await deleteToken();
            await refreshForUser();
            router.replace("/letYouIn");
          } catch (err) {
            Alert.alert("Error", "Could not log out. Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.route) {
      router.push(item.route);
      return;
    }
    if (item.onPress === "help") {
      Alert.alert(
        "Help Center",
        "Need assistance? Reach us at support@homeservice.app",
      );
      return;
    }
    if (item.onPress === "privacy") {
      Alert.alert(
        "Privacy Policy",
        "We protect your data and never share it without consent.",
      );
    }
  };

  const displayName = user?.fullName || user?.nickname || "User";
  const displayHandle = user?.nickname
    ? `@${user.nickname}`
    : user?.email || user?.phone || "";
  const avatarUrl = user?.profileImageUrl || null;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/home");
          }}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          {loading ? (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              {initials ? (
                <Text style={styles.initials}>{initials}</Text>
              ) : (
                <>
                  <View style={styles.avatarHead} />
                  <View style={styles.avatarBody} />
                </>
              )}
            </View>
          )}

          <Text style={styles.name} numberOfLines={1}>
            {loading ? "Loading…" : displayName}
          </Text>
          {!!displayHandle && !loading && (
            <Text style={styles.handle} numberOfLines={1}>
              {displayHandle}
            </Text>
          )}

          {(user?.email || user?.phone) && !loading ? (
            <View style={styles.metaRow}>
              {user?.email ? (
                <View style={styles.metaChip}>
                  <Feather name="mail" size={12} color={COLORS.primary} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              ) : null}
              {user?.phone ? (
                <View style={styles.metaChip}>
                  <Feather name="phone" size={12} color={COLORS.primary} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {user.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bookmarkedList?.length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.key}>
              <MenuRow
                item={item}
                badge={
                  item.key === "bookmark" ? bookmarkedList?.length : undefined
                }
                onPress={() => handleMenuPress(item)}
              />
              {index < MENU_ITEMS.length - 1 ? (
                <View style={styles.menuDivider} />
              ) : null}
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={COLORS.danger} />
          ) : (
            <>
              <View style={styles.logoutIconWrap}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.danger}
                />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>HomeService v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: COLORS.bg,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 32,
    color: COLORS.primary,
  },
  avatarHead: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C9A8FF",
    marginTop: 18,
  },
  avatarBody: {
    width: 48,
    height: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#C9A8FF",
    marginTop: 6,
  },
  name: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: "90%",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    maxWidth: 180,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 18,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 70,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 22,
    paddingVertical: 16,
    marginTop: 28,
    gap: 10,
  },
  logoutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    color: "#B0B0B0",
    fontSize: 12,
    marginTop: 18,
  },
});
