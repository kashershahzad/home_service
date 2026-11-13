import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addressApi, getToken } from "../utils/api";
import OsmMapPicker from "./OsmMapPicker";

const ACCENT = "#0E6E4C";
const SCREEN_BG = "#F6FAF8";
const DEFAULT_REGION = {
  latitude: 31.52,
  longitude: 74.35,
};

function normalizeList(data) {
  return data?.addresses || data?.data || (Array.isArray(data) ? data : []);
}

function mapAddress(raw) {
  if (!raw) return null;
  return {
    id: String(raw._id || raw.id || ""),
    label: raw.label || "Home",
    line: raw.line || raw.address || "",
    area: raw.area || "",
    city: raw.city || "",
    lat: Number(raw.lat ?? raw.latitude) || DEFAULT_REGION.latitude,
    lng: Number(raw.lng ?? raw.longitude) || DEFAULT_REGION.longitude,
    isDefault: !!raw.isDefault,
    raw,
  };
}

function buildAddressLine(place, latitude, longitude) {
  if (!place) return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  const parts = [
    place.name,
    place.street,
    place.district,
    place.city,
    place.region,
    place.country,
  ].filter(Boolean);
  const unique = parts.filter((p, i) => parts.indexOf(p) === i);
  return unique.join(", ") || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

async function reverseGeocodeOsm(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      latitude,
    )}&lon=${encodeURIComponent(longitude)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HomelyHomeServiceApp/1.0",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    return {
      line:
        data?.display_name ||
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      area: a.suburb || a.neighbourhood || a.county || a.city_district || "",
      city: a.city || a.town || a.village || a.state || "",
    };
  } catch {
    return null;
  }
}

/**
 * OpenStreetMap-based address manager.
 * Supports multiple saved addresses (list + add/edit).
 */
export default function ChangeAddressForm({
  initialAddress,
  onSaved,
  onCancel,
  accent = ACCENT,
  title = "Change Address",
  /** When true, after save ask “Add another” (profile addresses). */
  allowMultipleAdds = true,
  /** Booking “Change” — open list; tapping an address selects it (no edit map). */
  pickFromList = false,
}) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [mode, setMode] = useState("list"); // list | edit
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [addressId, setAddressId] = useState(null);
  const [label, setLabel] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });

  const loadAddresses = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("Please sign in again.");
    const data = await addressApi.list(token);
    const list = normalizeList(data).map(mapAddress).filter((a) => a?.id);
    setAddresses(list);
    return list;
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    setIsReverseGeocoding(true);
    try {
      const osm = await reverseGeocodeOsm(latitude, longitude);
      if (osm) {
        setAddressLine(osm.line);
        if (osm.area) setArea(osm.area);
        if (osm.city) setCity(osm.city);
        return;
      }

      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results?.length) {
        const place = results[0];
        setAddressLine(buildAddressLine(place, latitude, longitude));
        setArea(place.district || place.subregion || place.name || "");
        setCity(place.city || place.region || "");
      } else {
        setAddressLine(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      setAddressLine(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const applyCoordinate = (latitude, longitude, { geocode = true, animate = true } = {}) => {
    setMarkerCoordinate({ latitude, longitude });
    mapRef.current?.setCoordinate?.(latitude, longitude, animate);
    if (geocode) reverseGeocode(latitude, longitude);
  };

  const goToCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            "Location Permission Needed",
            "Please enable location access in Settings to use current location.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ],
          );
        }
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      applyCoordinate(position.coords.latitude, position.coords.longitude);
    } catch {
      Alert.alert("Location Error", "Could not get your current location.");
    } finally {
      setIsLocating(false);
    }
  };

  const openNewAddress = () => {
    setAddressId(null);
    setLabel("Home");
    setAddressLine("");
    setArea("");
    setCity("");
    setIsDefault(addresses.length === 0);
    setMode("edit");
    applyCoordinate(DEFAULT_REGION.latitude, DEFAULT_REGION.longitude, {
      geocode: false,
      animate: false,
    });
    setTimeout(() => goToCurrentLocation(), 250);
  };

  const openEditAddress = (item) => {
    setAddressId(item.id);
    setLabel(item.label || "Home");
    setAddressLine(item.line || "");
    setArea(item.area || "");
    setCity(item.city || "");
    setIsDefault(!!item.isDefault);
    setMode("edit");
    applyCoordinate(item.lat, item.lng, {
      geocode: !item.line,
      animate: false,
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await loadAddresses();
        if (!mounted) return;

        if (!pickFromList && (initialAddress?.id || initialAddress?._id)) {
          const match =
            list.find(
              (a) =>
                String(a.id) ===
                String(initialAddress.id || initialAddress._id),
            ) || mapAddress(initialAddress);
          if (match?.id) openEditAddress(match);
          else setMode("list");
        } else if (!list.length) {
          openNewAddress();
        } else {
          setMode("list");
        }
      } catch (err) {
        console.log("[address] load failed:", err?.message || err);
        if (pickFromList || !initialAddress) {
          setMode("list");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert("Missing address", "Tap the map or enter your address.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again.");

      const body = {
        label: (label || "Home").trim(),
        line: addressLine.trim(),
        area: (area || "").trim() || undefined,
        city: (city || "Lahore").trim(),
        lat: markerCoordinate.latitude,
        lng: markerCoordinate.longitude,
        isDefault: !!isDefault || addresses.length === 0,
      };

      let saved;
      if (addressId) {
        const res = await addressApi.update(token, addressId, body);
        saved = res?.address || res;
      } else {
        const res = await addressApi.create(token, body);
        saved = res?.address || res;
      }

      const mapped = mapAddress(saved) || {
        id: String(saved?._id || saved?.id || addressId || ""),
        label: body.label,
        line: body.line,
        area: body.area || "",
        city: body.city,
        lat: body.lat,
        lng: body.lng,
        isDefault: body.isDefault,
        raw: saved,
      };

      const list = await loadAddresses().catch(() => null);
      if (!list) {
        setAddresses((prev) => {
          const without = prev.filter((a) => a.id !== mapped.id);
          return [mapped, ...without];
        });
      }

      onSaved?.({
        addressId: mapped.id || null,
        address: mapped,
      });

      if (allowMultipleAdds) {
        Alert.alert(
          "Saved",
          addressId ? "Address updated." : "Address added.",
          [
            {
              text: "Add another",
              onPress: () => openNewAddress(),
            },
            {
              text: "Done",
              style: "cancel",
              onPress: () => setMode("list"),
            },
          ],
        );
      } else {
        setMode("list");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  // StatusBar is opaque (translucent=false) so Android already lays out
  // below the bar — only add a small gap. iOS still needs insets.top.
  const topPad =
    Platform.OS === "ios"
      ? Math.max(insets.top, 12) + 10
      : Math.max(insets.top, 0) + 16;
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 32 : 16);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={SCREEN_BG}
          translucent={false}
        />
        <ActivityIndicator color={accent} size="large" />
      </View>
    );
  }

  if (mode === "list") {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={SCREEN_BG}
          translucent={false}
        />
        <View style={styles.listHeader}>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={onCancel}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.listTitle}>{title}</Text>
          <View style={styles.roundBtnSpacer} />
        </View>

        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomPad + 96 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="location-outline" size={40} color="#9AA8A1" />
              <Text style={styles.emptyTitle}>No addresses yet</Text>
              <Text style={styles.emptySub}>
                Add one or more locations for bookings.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.addressCard}
              activeOpacity={0.85}
              onPress={() => {
                if (pickFromList) {
                  onSaved?.({ addressId: item.id, address: item });
                  return;
                }
                openEditAddress(item);
              }}
            >
              <View
                style={[styles.addressIcon, { backgroundColor: `${accent}18` }]}
              >
                <Ionicons name="location" size={20} color={accent} />
              </View>
              <View style={styles.addressBody}>
                <View style={styles.addressTitleRow}>
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  {item.isDefault ? (
                    <View style={[styles.defaultBadge, { backgroundColor: accent }]}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.addressLine} numberOfLines={2}>
                  {item.line || `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
                </Text>
                {item.city ? (
                  <Text style={styles.addressMeta}>{item.city}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
            </TouchableOpacity>
          )}
        />

        <View
          style={[
            styles.addFabBar,
            { paddingBottom: bottomPad, backgroundColor: SCREEN_BG },
          ]}
        >
          <TouchableOpacity
            style={[styles.addFab, { backgroundColor: accent }]}
            activeOpacity={0.9}
            onPress={openNewAddress}
          >
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.addFabText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={SCREEN_BG}
        translucent={false}
      />
      <OsmMapPicker
        ref={mapRef}
        style={styles.map}
        accent={accent}
        coordinate={markerCoordinate}
        onCoordinateChange={({ latitude, longitude }) => {
          setMarkerCoordinate({ latitude, longitude });
          reverseGeocode(latitude, longitude);
        }}
      />

      <View style={[styles.headerRow, { top: topPad }]}>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => {
            if (addresses.length) setMode("list");
            else onCancel?.();
          }}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {addressId ? "Edit Address" : "Add Address"}
        </Text>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={goToCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={accent} />
          ) : (
            <Ionicons name="navigate-outline" size={20} color={accent} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.bottomCard, { paddingBottom: bottomPad + 12 }]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Selected Location</Text>
          <Text style={styles.osmHint}>OpenStreetMap · tap or drag pin</Text>

          <Text style={styles.fieldLabel}>Label</Text>
          <TextInput
            style={styles.labelInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Home, Office…"
            placeholderTextColor="#9A9A9A"
          />

          <Text style={styles.fieldLabel}>Address</Text>
          <View style={styles.addressRow}>
            {isReverseGeocoding ? (
              <View style={styles.addressLoadingRow}>
                <ActivityIndicator size="small" color={accent} />
                <Text style={styles.addressLoadingText}>Finding address…</Text>
              </View>
            ) : (
              <TextInput
                style={styles.addressInput}
                value={addressLine}
                onChangeText={setAddressLine}
                placeholder="Tap map to drop a pin"
                placeholderTextColor="#9A9A9A"
                multiline
              />
            )}
            <Ionicons name="location" size={20} color={accent} />
          </View>

          <View style={styles.defaultRow}>
            <Text style={styles.defaultLabel}>Set as default</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#D5D5D5", true: `${accent}88` }}
              thumbColor={isDefault ? accent : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: accent },
              (!addressLine.trim() || isReverseGeocoding || saving) &&
                styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!addressLine.trim() || isReverseGeocoding || saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {addressId ? "Update Address" : "Save Address"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  centered: { alignItems: "center", justifyContent: "center" },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  listTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#14332C",
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7C75",
    textAlign: "center",
    lineHeight: 18,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8ECEA",
    gap: 12,
  },
  addressIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addressBody: { flex: 1 },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  addressLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
  defaultBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addressLine: { fontSize: 13, color: "#526B63", lineHeight: 18 },
  addressMeta: { marginTop: 2, fontSize: 12, color: "#8A948F" },
  addFabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  addFab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    minWidth: 180,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  addFabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  headerRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 2,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  roundBtnSpacer: { width: 40, height: 40 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "55%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  osmHint: {
    fontSize: 12,
    color: "#8A948F",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9A9A9A",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  labelInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#000",
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    paddingVertical: 12,
    minHeight: 44,
  },
  addressLoadingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  addressLoadingText: { marginLeft: 8, fontSize: 14, color: "#6B6B6B" },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  defaultLabel: { fontSize: 14, fontWeight: "600", color: "#14332C" },
  primaryButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
