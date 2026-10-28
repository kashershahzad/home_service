import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../../../assets/fonts/fonts";
import { images } from "../../../assets/images/image";

const ACCENT = "#0E6E4C";
const BG = "#F6FAF8";
const HEADER_BG = "#FFFFFF";
const TEXT = "#111827";
const MUTED = "#6B7280";

const CATEGORIES = [
  {
    id: "men",
    title: "Men",
    subtitle: "Haircuts, grooming & special packages",
    image: images.haircutMen,
    badgeIcon: images.scissors,
    badgeLabel: "Popular",
  },
  {
    id: "children",
    title: "Children",
    subtitle: "Kids haircuts & newborn services",
    image: images.haircutChildren,
    badgeIcon: images.family,
    badgeLabel: "Family Friendly",
  },
];

function CategoryCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={item.image}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.badge}>
          <Image
            source={item.badgeIcon}
            style={styles.badgeIcon}
            resizeMode="contain"
          />
          <Text style={styles.badgeText}>{item.badgeLabel}</Text>
        </View>

        <Image
          source={selected ? images.checked : images.unchecked}
          style={styles.checkIcon}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.cardFooter, selected && styles.cardFooterSelected]}>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={selected ? ACCENT : "#9CA3AF"}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function BookHaircutService() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedId, setSelectedId] = useState("men");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>Who is the service for?</Text>
        <Text style={styles.heroSubtitle}>
          Choose a category to explore packages.
        </Text>

        <View style={styles.list}>
          {CATEGORIES.map((item) => (
            <CategoryCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onPress={() => setSelectedId(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.continueBtn}
          onPress={() => {
            router.push({
              pathname: "/booking/bookHaircutService/packages",
              params: {
                ...params,
                category: selectedId,
              },
            });
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === "ios" ? 54 : 28,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: "#191C1C",
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: "#151C27",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#555F6F",
    marginBottom: 20,
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,

    borderColor: "#BEC9C480",
  },
  cardSelected: {
    borderColor: "#0E6E5C",
    borderWidth: 2,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  badgeIcon: {
    width: 13,
    height: 13,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: "#151C27",
  },
  checkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: "#fff",
  },
  cardFooterSelected: {
    backgroundColor: "#EBF5F2",
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: TEXT,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: BG,
  },
  continueBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: "#fff",
  },
});
