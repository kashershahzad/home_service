import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import {
  fetchCatalogCategory,
  mapCatalogAddOns,
  mapCatalogPackages,
} from "../../../utils/catalog";

const ACCENT = "#0E6E5C";
const SELECTED_BG = "#E4F3EF";
const BG = "#F6FAF8";
const HEADER_BG = "#FFFFFF";
const TEXT = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const SPECIAL_BG = "#EDE7F6";
const SPECIAL_TEXT = "#5E35B1";

function PackageCard({ item, selected, onPress, durationFirst = false }) {
  const active = selected;

  const durationBlock = (
    <View style={styles.durationRow}>
      <Image
        source={images.time2}
        style={[styles.timeIcon, active && styles.timeIconActive]}
        resizeMode="contain"
      />
      <Text style={[styles.duration, active && styles.durationActive]}>
        {item.duration}
      </Text>
    </View>
  );

  const priceBlock = (
    <Text style={[styles.price, active && styles.priceActive]}>
      Rs. {item.price}
    </Text>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, active && styles.cardSelected]}
    >
      {item.recommended ? (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      ) : null}

      <Image
        source={active ? images.radioChecked : images.radioUnchecked}
        style={[
          styles.checkIcon,
          item.recommended && styles.checkIconRecommended,
        ]}
        resizeMode="contain"
      />

      <View style={styles.titleRow}>
        <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
          {item.title}
        </Text>
        {item.special ? (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>Special</Text>
          </View>
        ) : null}
        {item.gentleCare ? (
          <View style={styles.gentleCareBadge}>
            <Image
              source={images.gentleCareIcon}
              style={styles.gentleCareIcon}
              resizeMode="contain"
            />
            <Text style={styles.gentleCareText}>Gentle Care</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.cardDesc, active && styles.cardDescActive]}>
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        {durationFirst ? durationBlock : priceBlock}
        <Text style={styles.metaDot}>•</Text>
        {durationFirst ? priceBlock : durationBlock}
      </View>
    </TouchableOpacity>
  );
}

function AddonChip({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.addonChip, selected && styles.addonChipSelected]}
    >
      <Text style={[styles.addonText, selected && styles.addonTextSelected]}>
        {item.title}
        {item.price ? ` · Rs. ${item.price}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

export default function HaircutPackages() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params?.category || "men";
  const isMen = category !== "children";
  const audience = isMen ? "men" : "children";

  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Catalog API #5 (men) / #6 (children)
        const { category: cat } = await fetchCatalogCategory(
          "hair-dressing",
          audience,
        );
        if (!mounted) return;
        const mappedPkgs = mapCatalogPackages(cat?.packages || []);
        const mappedAddOns = mapCatalogAddOns(cat?.addOns || []);
        setPackages(mappedPkgs);
        setAddOns(mappedAddOns);

        const preferred =
          mappedPkgs.find((p) => p.recommended) ||
          mappedPkgs.find((p) => /aqiqah|newborn/i.test(p.title)) ||
          mappedPkgs[0];
        setSelectedId(preferred?.id || null);
      } catch (err) {
        if (mounted) setError(err?.message || "Could not load packages");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [audience]);

  const title = isMen ? "Men's Packages" : "Children's Packages";
  const subtitle = isMen
    ? "Choose a package and add extras."
    : "Choose a package for your child.";

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedId),
    [packages, selectedId],
  );

  const toggleAddOn = (id) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    if (!selectedPackage) return;
    const selectedAddOns = addOns
      .filter((a) => selectedAddOnIds.includes(a.id))
      .map((a) => ({
        id: a.id,
        title: a.title,
        shortTitle: a.shortTitle || a.title,
        price: a.price,
      }));
    router.push({
      pathname: "/booking/bookHaircutService/schedule",
      params: {
        ...params,
        category: String(category),
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        packageDuration: selectedPackage.duration,
        price: String(selectedPackage.priceRaw || selectedPackage.price || ""),
        addOnIds: JSON.stringify(selectedAddOnIds),
        addOns: JSON.stringify(selectedAddOns),
        catalogSlug: "hair-dressing",
      },
    });
  };

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>

        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.list}>
              {packages.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  selected={item.id === selectedId}
                  onPress={() => setSelectedId(item.id)}
                  durationFirst={!isMen}
                />
              ))}
            </View>

            {addOns.length > 0 ? (
              <View style={styles.addonsWrap}>
                <Text style={styles.addonsTitle}>Add-ons</Text>
                <View style={styles.addonsRow}>
                  {addOns.map((item) => (
                    <AddonChip
                      key={item.id}
                      item={item}
                      selected={selectedAddOnIds.includes(item.id)}
                      onPress={() => toggleAddOn(item.id)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.continueBtn,
            (!selectedPackage || loading) && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPackage || loading}
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
    paddingTop: 18,
    paddingBottom: 24,
  },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    color: TEXT,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: MUTED,
    marginBottom: 18,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    paddingTop: 18,
    position: "relative",
  },
  cardSelected: {
    borderColor: ACCENT,
    backgroundColor: SELECTED_BG,
    borderWidth: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: -10,
    left: 16,
    backgroundColor: ACCENT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recommendedText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  checkIcon: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 22,
    height: 22,
  },
  checkIconRecommended: {
    top: 22,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingRight: 28,
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: TEXT,
  },
  cardTitleActive: {
    color: ACCENT,
  },
  specialBadge: {
    backgroundColor: SPECIAL_BG,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specialText: {
    color: SPECIAL_TEXT,
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  gentleCareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5F0",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gentleCareIcon: {
    width: 12,
    height: 12,
  },
  gentleCareText: {
    color: ACCENT,
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: MUTED,
    marginBottom: 10,
  },
  cardDescActive: {
    color: "#3F5E54",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeIcon: {
    width: 14,
    height: 14,
    tintColor: MUTED,
  },
  timeIconActive: {
    tintColor: ACCENT,
  },
  duration: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: MUTED,
  },
  durationActive: {
    color: ACCENT,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: TEXT,
  },
  priceActive: {
    color: ACCENT,
  },
  metaDot: {
    color: MUTED,
  },
  addonsWrap: {
    marginTop: 22,
  },
  addonsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: TEXT,
    marginBottom: 10,
  },
  addonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addonChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addonChipSelected: {
    borderColor: ACCENT,
    backgroundColor: SELECTED_BG,
  },
  addonText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: MUTED,
  },
  addonTextSelected: {
    color: ACCENT,
  },
  errorText: {
    color: "#B91C1C",
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    paddingTop: 10,
    backgroundColor: BG,
  },
  continueBtn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
