import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import BottomTabBar from "../components/components/BottomTabBar";
import { useBookmarks } from "../context/BookmarkContext";
import { logout as logoutAuth } from "../store/reducer/AuthConfig";
import { clearUserData, setUserData } from "../store/reducer/usersSlice";
import { authApi, deleteToken, getToken } from "../utils/api";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#EEEEEE",
  danger: "#FF3B30",
  dangerSoft: "#FFECEC",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const MENU_ITEMS = [
  {
    key: "history",
    label: "Bookings History",
    icon: "time-outline",
    color: "#2ECC71",
    bg: "#E6FBEF",
    route: "/bookings-history",
  },
  {
    key: "edit",
    label: "Edit Profile",
    icon: "person-outline",
    color: "#7310FF",
    bg: "#F1E7FF",
    route: "/edit-profile",
  },
  {
    key: "bookmark",
    label: "My Bookmark",
    icon: "bookmark-outline",
    color: "#FF6F91",
    bg: "#FFE9EC",
    route: "/my-bookmark",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    color: "#F5B301",
    bg: "#FFF6DE",
    route: "/notifications",
  },
  {
    key: "offers",
    label: "Special Offers",
    icon: "gift-outline",
    color: "#8A5CF6",
    bg: "#EFE7FF",
    route: "/special-offers",
  },
  {
    key: "contact",
    label: "Contact Us",
    icon: "call-outline",
    color: "#FF8A3D",
    bg: "#FFF0E6",
    route: "/contact-us",
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: "shield-checkmark-outline",
    color: "#5B6CFF",
    bg: "#EEF0FF",
    route: "/privacy-policy",
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
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const storedUser = useSelector((state) => state.users.userData);
  const [user, setUser] = useState(storedUser?.id ? storedUser : null);
  const { refreshForUser, bookmarkedList } = useBookmarks();

  const loadProfile = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const profile = await authApi.getMe(token);
      const userData = profile?.user || profile;
      setUser(userData);
      dispatch(setUserData(userData));
    } catch (err) {
      console.log("Could not load profile:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile]),
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await deleteToken();
            dispatch(logoutAuth());
            dispatch(clearUserData());
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
    }
  };

  const displayName = user?.fullName || user?.nickname || "User";
  const subtitle = user?.email || user?.phone || "";
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
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
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
                  <Ionicons name="person" size={40} color="#C9A8FF" />
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/edit-profile")}
            >
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {loading ? "Loading…" : displayName}
          </Text>
          {!!subtitle && !loading ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

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
              <Ionicons
                name="log-out-outline"
                size={20}
                color={COLORS.danger}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>HomeService v1.0.0</Text>
      </ScrollView>
      <BottomTabBar active="profile" />
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
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarWrap: {
    marginBottom: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 34,
    color: COLORS.primary,
  },
  editAvatarBtn: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 13,
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
    marginLeft: 60,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 22,
    paddingVertical: 16,
    marginTop: 22,
    gap: 8,
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
    marginTop: 16,
  },
});
