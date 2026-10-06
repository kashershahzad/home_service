import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "../../assets/images/image";
import fonts from "../assets/fonts";
import CustomText from "./CustomText";

const TABS = [
  { key: "home", label: "Home", icon: images.hometab, route: "/home" },
  {
    key: "bookings",
    label: "Bookings",
    icon: images.bookingtab,
    route: "/bookings",
  },
  { key: "wallet", label: "Wallet", icon: images.wallettab, route: "/wallet" },
  {
    key: "profile",
    label: "Profile",
    icon: images.profiletab,
    route: "/profile",
  },
];

const BottomTabBar = ({ active = "home" }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => {
              if (!isActive) router.replace(tab.route);
            }}
            style={styles.item}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  { tintColor: isActive ? "#064E3B" : "#8AA39A" },
                ]}
              />
            </View>
            <CustomText
              label={tab.label}
              fontSize={10}
              fontFamily={isActive ? fonts.extraBold : fonts.medium}
              color={isActive ? "#0B593D" : "#748D85"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEF3F1",
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: "#E8F6EF",
  },
  icon: {
    width: 15,
    height: 17,
    resizeMode: "contain",
  },
});
