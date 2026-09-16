import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

const DEFAULT_REGION = {
  latitude: 31.4504,
  longitude: 73.135,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function AddressLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef(null);

  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    goToCurrentLocation(DEFAULT_REGION);
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    setIsReverseGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const place = results[0];
        const parts = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
          place.country,
        ].filter(Boolean);
        const unique = parts.filter((p, i) => parts.indexOf(p) === i);
        setAddress(unique.join(', '));
      } else {
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (err) {
      setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
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
      setMarkerCoordinate({ latitude: region.latitude, longitude: region.longitude });
      mapRef.current?.animateToRegion(region, 400);
      reverseGeocode(region.latitude, region.longitude);
    } catch (err) {
      if (fallbackRegion) {
        setMapRegion(fallbackRegion);
        setMarkerCoordinate({
          latitude: fallbackRegion.latitude,
          longitude: fallbackRegion.longitude,
        });
        reverseGeocode(fallbackRegion.latitude, fallbackRegion.longitude);
      }
    } finally {
      setIsLocating(false);
    }
  };

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

  const isFormValid = address.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;
    router.push({
      pathname: '/payment-method',
      params: {
        ...params,
        address: address.trim(),
        latitude: String(markerCoordinate.latitude),
        longitude: String(markerCoordinate.longitude),
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={mapRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterest
        showsBuildings
        mapType="standard"
      >
        <Marker coordinate={markerCoordinate} draggable onDragEnd={handleMarkerDragEnd}>
          <View style={styles.avatarMarkerRing}>
            <View style={styles.avatarMarkerInner}>
              <Ionicons name="person" size={16} color="#7310FF" />
            </View>
          </View>
        </Marker>
      </MapView>

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Address/Location</Text>
      </View>

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={() => goToCurrentLocation(mapRegion)}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color="#7310FF" />
        ) : (
          <Ionicons name="navigate-outline" size={20} color="#7310FF" />
        )}
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomCard}
      >
        <Text style={styles.sectionLabel}>Location Details</Text>
        <Text style={styles.fieldLabel}>Address</Text>

        <View style={styles.addressRow}>
          {isReverseGeocoding ? (
            <View style={styles.addressLoadingRow}>
              <ActivityIndicator size="small" color="#7310FF" />
              <Text style={styles.addressLoadingText}>Finding address…</Text>
            </View>
          ) : (
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              placeholderTextColor="#9A9A9A"
              value={address}
              onChangeText={setAddress}
            />
          )}
          <Ionicons name="location" size={20} color="#7310FF" />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid || isReverseGeocoding}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerRow: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  currentLocationButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  avatarMarkerRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: '#7310FF',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMarkerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#9A9A9A', marginBottom: 6 },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  addressInput: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 14 },
  addressLoadingRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  addressLoadingText: { marginLeft: 8, fontSize: 14, color: '#6B6B6B' },

  primaryButton: {
    backgroundColor: '#7310FF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: { backgroundColor: '#C9A8FF' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});