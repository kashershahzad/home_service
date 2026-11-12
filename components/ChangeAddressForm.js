import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addressApi, getToken } from "../utils/api";
import { MapView, Marker, PROVIDER_GOOGLE } from "./Map";

const ACCENT = "#0E6E4C";
const DEFAULT_REGION = {
  latitude: 31.52,
  longitude: 74.35,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

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

/**
 * Map-based Change Address (same UX as signup map picker).
 * Saves via Postman 05 create/update address APIs.
 * onSaved({ addressId, address })
 */
export default function ChangeAddressForm({
  initialAddress,
  onSaved,
  onCancel,
  accent = ACCENT,
  title = "Change Address",
}) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [addressId, setAddressId] = useState(
    initialAddress?.id || initialAddress?._id || null,
  );
  const [label, setLabel] = useState(initialAddress?.label || "Home");
  const [addressLine, setAddressLine] = useState(initialAddress?.line || "");
  const [area, setArea] = useState(initialAddress?.area || "");
  const [city, setCity] = useState(initialAddress?.city || "");

  const startLat = Number(initialAddress?.lat) || DEFAULT_REGION.latitude;
  const startLng = Number(initialAddress?.lng) || DEFAULT_REGION.longitude;

  const [mapRegion, setMapRegion] = useState({
    latitude: startLat,
    longitude: startLng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: startLat,
    longitude: startLng,
  });

  const reverseGeocode = async (latitude, longitude) => {
    setIsReverseGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (results?.length) {
        const place = results[0];
        setAddressLine(buildAddressLine(place, latitude, longitude));
        setArea(place.district || place.subregion || place.name || area);
        setCity(place.city || place.region || city);
      } else {
        setAddressLine(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      setAddressLine(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const goToCurrentLocation = async (fallbackRegion) => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (fallbackRegion) {
          setMapRegion(fallbackRegion);
          setMarkerCoordinate({
            latitude: fallbackRegion.latitude,
            longitude: fallbackRegion.longitude,
          });
          reverseGeocode(fallbackRegion.latitude, fallbackRegion.longitude);
        }
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
      const region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setMapRegion(region);
      setMarkerCoordinate({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      mapRef.current?.animateToRegion(region, 400);
      reverseGeocode(region.latitude, region.longitude);
    } catch {
      if (fallbackRegion) {
        setMapRegion(fallbackRegion);
        setMarkerCoordinate({
          latitude: fallbackRegion.latitude,
          longitude: fallbackRegion.longitude,
        });
        reverseGeocode(fallbackRegion.latitude, fallbackRegion.longitude);
      }
      Alert.alert("Location Error", "Could not get your current location.");
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert("Error", "Please sign in again.");
          return;
        }
        const data = await addressApi.list(token);
        const list =
          data?.addresses || data?.data || (Array.isArray(data) ? data : []);
        const preferred =
          list.find((a) => a.isDefault) ||
          list.find(
            (a) =>
              String(a._id || a.id) ===
              String(initialAddress?.id || initialAddress?._id || ""),
          ) ||
          list[0] ||
          null;

        if (!mounted) return;

        if (preferred) {
          const lat = Number(preferred.lat) || DEFAULT_REGION.latitude;
          const lng = Number(preferred.lng) || DEFAULT_REGION.longitude;
          const region = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          setAddressId(preferred._id || preferred.id || null);
          setLabel(preferred.label || "Home");
          setAddressLine(preferred.line || "");
          setArea(preferred.area || "");
          setCity(preferred.city || "");
          setMapRegion(region);
          setMarkerCoordinate({ latitude: lat, longitude: lng });
          mapRef.current?.animateToRegion(region, 300);
          if (!preferred.line) reverseGeocode(lat, lng);
        } else if (!initialAddress?.line) {
          await goToCurrentLocation(DEFAULT_REGION);
        } else {
          reverseGeocode(startLat, startLng);
        }
      } catch (err) {
        console.log("[address] map load failed:", err?.message || err);
        if (!initialAddress?.line) {
          await goToCurrentLocation(DEFAULT_REGION);
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

  const handleMarkerDragEnd = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleSave = async () => {
    if (!addressLine.trim()) {
      Alert.alert("Missing address", "Move the map or enter your address.");
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
        isDefault: true,
      };

      let saved;
      if (addressId) {
        const res = await addressApi.update(token, addressId, body);
        saved = res?.address || res;
      } else {
        const res = await addressApi.create(token, body);
        saved = res?.address || res;
      }

      const id = saved?._id || saved?.id || addressId;
      onSaved?.({
        addressId: id ? String(id) : null,
        address: {
          id: id ? String(id) : null,
          label: saved?.label || body.label,
          line: saved?.line || body.line,
          area: saved?.area || body.area || "",
          city: saved?.city || body.city,
          lat: saved?.lat ?? body.lat,
          lng: saved?.lng ?? body.lng,
          raw: saved,
        },
      });
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterest
        showsBuildings
        mapType="standard"
      >
        <Marker
          coordinate={markerCoordinate}
          draggable
          onDragEnd={handleMarkerDragEnd}
          pinColor={accent}
        />
      </MapView>

      {loading ? (
        <View style={styles.loadingBanner} pointerEvents="none">
          <ActivityIndicator color={accent} />
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={onCancel}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => goToCurrentLocation(mapRegion)}
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
        style={[
          styles.bottomCard,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        <Text style={styles.sectionLabel}>Selected Location</Text>

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
              placeholder="Move the map to drop a pin"
              placeholderTextColor="#9A9A9A"
              multiline
            />
          )}
          <Ionicons name="location" size={20} color={accent} />
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8EEF0" },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingBanner: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 24,
  },
  headerRow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 28,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
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
    marginBottom: 16,
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
  primaryButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
