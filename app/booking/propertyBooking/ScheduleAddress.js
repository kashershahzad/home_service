import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "../../../assets/fonts/fonts";
import { images } from "../../../assets/images/image";
import ChangeAddressForm from "../../../components/ChangeAddressForm";
import { addressApi, getToken } from "../../../utils/api";
import {
  fetchCatalogCategory,
  mapCatalogTimeSlots,
} from "../../../utils/catalog";
import StepsHeader from "./components/StepsHeader";

const ACCENT = "#0E6E4C";
const CARD_BG = "#F2F4F3";
const ACTIVE_BG = "#C8EADF";

const FALLBACK_TIME_SLOTS = [
  {
    id: "morning",
    title: "Morning",
    range: "8:00 AM – 11:00 AM",
    displayTime: "8:00 AM",
    icon: images.morning,
  },
  {
    id: "afternoon",
    title: "Afternoon",
    range: "12:00 PM – 3:00 PM",
    displayTime: "12:00 PM",
    icon: images.afternoon,
  },
  {
    id: "evening",
    title: "Evening",
    range: "4:00 PM – 7:00 PM",
    displayTime: "4:00 PM",
    icon: images.evening,
  },
];

const DEFAULT_ADDRESS = {
  label: "Home",
  line: "House # 123, Street 5, Block B, Faisalabad",
};

function buildDateOptions(count = 7) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: date.toISOString().slice(0, 10),
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: String(date.getDate()),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });
}

function TimeSlotCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.timeCard, selected && styles.timeCardSelected]}
    >
      <View style={styles.timeLeft}>
        <View
          style={[styles.timeIconBox, selected && styles.timeIconBoxSelected]}
        >
          <Image
            source={item.icon}
            style={styles.timeIcon}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.timeTitle}>{item.title}</Text>
          <Text style={styles.timeRange}>{item.range}</Text>
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ScheduleAddress({
  initialSchedule,
  onBack,
  onContinue,
  hideSteps = false,
  catalogSlug = "home-cleaning",
  loadCatalogSlots = true,
  initialTimeSlots,
  step = 5,
  totalSteps = 6,
}) {
  const dateOptions = useMemo(() => buildDateOptions(7), []);
  const [timeSlots, setTimeSlots] = useState(
    Array.isArray(initialTimeSlots) && initialTimeSlots.length
      ? initialTimeSlots
      : FALLBACK_TIME_SLOTS,
  );
  const [slotsLoading, setSlotsLoading] = useState(
    !!loadCatalogSlots &&
      !(Array.isArray(initialTimeSlots) && initialTimeSlots.length),
  );
  const [selectedDateId, setSelectedDateId] = useState(
    initialSchedule?.dateId || dateOptions[2]?.id || dateOptions[0]?.id,
  );
  const [timeSlotId, setTimeSlotId] = useState(
    initialSchedule?.timeSlotId || "afternoon",
  );
  const [address, setAddress] = useState(
    initialSchedule?.address || DEFAULT_ADDRESS,
  );
  const [addressId, setAddressId] = useState(
    initialSchedule?.addressId || initialSchedule?.address?.id || null,
  );
  const [changeOpen, setChangeOpen] = useState(false);
  const [addressLoading, setAddressLoading] = useState(
    !initialSchedule?.address,
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (initialSchedule?.address && initialSchedule?.addressId) {
        setAddressLoading(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const data = await addressApi.list(token);
        const list =
          data?.addresses ||
          data?.data ||
          (Array.isArray(data) ? data : []);
        const preferred =
          list.find((a) => a.isDefault) || list[0] || null;
        if (!mounted || !preferred) return;
        setAddressId(preferred._id || preferred.id || null);
        setAddress({
          id: preferred._id || preferred.id || null,
          label: preferred.label || "Home",
          line: preferred.line || "",
          area: preferred.area || "",
          city: preferred.city || "",
        });
      } catch (err) {
        console.log("[address] schedule load failed:", err?.message || err);
      } finally {
        if (mounted) setAddressLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialSchedule?.address, initialSchedule?.addressId]);

  useEffect(() => {
    if (Array.isArray(initialTimeSlots) && initialTimeSlots.length) {
      setTimeSlots(initialTimeSlots);
      setTimeSlotId((prev) =>
        initialTimeSlots.some((s) => s.id === prev)
          ? prev
          : initialTimeSlots[0].id,
      );
      setSlotsLoading(false);
      return;
    }

    if (!loadCatalogSlots || !catalogSlug) {
      setSlotsLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        // Catalog API #4 — timeSlots from home-cleaning (also reused for hair schedule UI)
        const { category } = await fetchCatalogCategory(catalogSlug);
        const mapped = mapCatalogTimeSlots(category?.timeSlots || []);
        if (!mounted) return;
        if (mapped.length) {
          setTimeSlots(mapped);
          setTimeSlotId((prev) =>
            mapped.some((s) => s.id === prev) ? prev : mapped[0].id,
          );
        }
      } catch (err) {
        console.log("[catalog] timeSlots failed:", err?.message || err);
      } finally {
        if (mounted) setSlotsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [catalogSlug, loadCatalogSlots, initialTimeSlots]);

  const selectedDate = dateOptions.find((d) => d.id === selectedDateId);
  const monthLabel = selectedDate
    ? selectedDate.date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const handleContinue = () => {
    const slot = timeSlots.find((s) => s.id === timeSlotId);
    onContinue?.({
      dateId: selectedDateId,
      date: selectedDate?.date?.toISOString?.() || null,
      timeSlotId,
      timeLabel: slot?.title,
      timeRange: slot?.range,
      displayTime: slot?.displayTime,
      address,
      addressId: addressId || address?.id || null,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepsHeader
          title="Schedule & Address"
          onBack={onBack}
          step={step}
          total={totalSteps}
          progressRight="Schedule"
          hideSteps={hideSteps}
        />

        <View style={styles.contentBody}>
          <Text style={styles.heroTitle}>When should we come?</Text>
          <Text style={styles.heroSubtitle}>
            Choose a convenient date and time.
          </Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Select Date</Text>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dateOptions.map((item) => {
              const active = item.id === selectedDateId;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.dateCard, active && styles.dateCardActive]}
                  onPress={() => setSelectedDateId(item.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.dateDay, active && styles.dateTextActive]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[styles.dateNum, active && styles.dateTextActive]}
                  >
                    {item.dayNum}
                  </Text>
                  <Text
                    style={[styles.dateMonth, active && styles.dateTextActive]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>
            Preferred time
          </Text>
          <View style={styles.timeList}>
            {slotsLoading ? (
              <ActivityIndicator color={ACCENT} style={{ marginVertical: 16 }} />
            ) : (
              timeSlots.map((item) => (
                <TimeSlotCard
                  key={item.id}
                  item={item}
                  selected={item.id === timeSlotId}
                  onPress={() => setTimeSlotId(item.id)}
                />
              ))
            )}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
            Service address
          </Text>
          <View style={styles.addressCard}>
            <View style={styles.addressIconBox}>
              <Image
                source={images.bookingHome}
                style={styles.addressIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.addressCopy}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressTitle}>
                  {address.label || "Home"}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setChangeOpen(true)}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
              {addressLoading ? (
                <ActivityIndicator
                  color={ACCENT}
                  style={{ alignSelf: "flex-start", marginTop: 4 }}
                />
              ) : (
                <Text style={styles.addressLine}>
                  {address.line || "No address saved yet"}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={changeOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setChangeOpen(false)}
        >
          <SafeAreaView style={styles.modalSafe} edges={[]}>
            <ChangeAddressForm
              title="Change Address"
              initialAddress={{
                ...address,
                id: addressId || address?.id,
                lat: address?.lat,
                lng: address?.lng,
              }}
              onCancel={() => setChangeOpen(false)}
              onSaved={({ addressId: id, address: next }) => {
                setAddressId(id);
                setAddress(next);
                setChangeOpen(false);
              }}
            />
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6FAF8" },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  contentBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fonts.extraBold,
    color: "#191C1C",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#6F7975",
    marginBottom: 22,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: "#0E6E5C",
    marginBottom: 12,
  },
  dateRow: {
    gap: 10,
    paddingRight: 4,
    marginBottom: 4,
  },
  dateCard: {
    width: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    backgroundColor: "#FFFFFF",
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dateCardActive: {
    backgroundColor: "#0E6E5C",
  },
  dateDay: {
    width: "100%",
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#6F7975",
    marginBottom: 4,
    textAlign: "center",
  },
  dateNum: {
    width: "100%",
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#191C1C",
    marginBottom: 2,
    textAlign: "center",
  },
  dateMonth: {
    width: "100%",
    fontSize: 12,
    fontFamily: fonts.medium,
    color: "#6F7975",
    textAlign: "center",
  },
  dateTextActive: { color: "#FFFFFF" },
  timeList: { gap: 10, marginBottom: 12 },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BEC9C4",
    padding: 14,
    minHeight: 70,
  },
  timeCardSelected: {
    borderColor: "#0E6E5C",
    backgroundColor: "#C8EADF66",
    borderWidth: 2,
  },
  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  timeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2F4F3",
    alignItems: "center",
    justifyContent: "center",
  },
  timeIconBoxSelected: {
    backgroundColor: ACTIVE_BG,
  },
  timeIcon: { width: 19, height: 14 },
  timeTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6F7975",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: ACCENT,
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4ECE8",
    padding: 14,
    gap: 12,
  },
  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: ACTIVE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  addressIcon: { width: 19, height: 14, tintColor: ACCENT },

  addressCopy: { flex: 1 },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#191C1C",
  },
  changeLink: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: ACCENT,
  },
  addressLine: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#6F7975",
    lineHeight: 19,
    paddingRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "transparent",
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
  continueText: { color: "#fff", fontSize: 16, fontFamily: fonts.bold },
  modalSafe: { flex: 1, backgroundColor: "#F6FAF8" },
});
