import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Linking,
  Animated,
  PanResponder,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CountryPicker } from 'react-native-country-codes-picker';
import { authApi, saveToken } from '../utils/api';
import { useBookmarks } from '../context/BookmarkContext';
const DEFAULT_REGION = {
  latitude: 31.4504,
  longitude: 73.135,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function FillProfileScreen() {
  const router = useRouter();
  const { refreshForUser } = useBookmarks();
  const nicknameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const mapRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    setShowPhotoOptions(true);
  };
  useEffect(() => {
    if (showPhotoOptions) {
      sheetTranslateY.setValue(400);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
          mass: 0.9,
        }),
      ]).start();
    }
  }, [showPhotoOptions]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPhotoOptions(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 8 && gestureState.dy > 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
          const progress = Math.min(gestureState.dy / 400, 1);
          backdropOpacity.setValue(1 - progress);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeSheet();
        } else {
          Animated.parallel([
            Animated.spring(sheetTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 20,
              stiffness: 180,
              mass: 0.9,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('+92');
  const [countryFlag, setCountryFlag] = useState('🇵🇰');
  const [phone, setPhone] = useState('');

  // ----- Address / Map picker state -----
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [previewAddress, setPreviewAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const openCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            'Camera Permission Needed',
            'Please enable camera access in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('Permission Needed', 'Camera permission was not granted.');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Camera Error', String(err?.message || err));
    }
  };

  const openGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            'Gallery Permission Needed',
            'Please enable photo access in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('Permission Needed', 'Gallery permission was not granted.');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Gallery Error', String(err?.message || err));
    }
  };

  const handleTakePhoto = () => {
    closeSheet();
    openCamera();
  };

  const handleChooseGallery = () => {
    closeSheet();
    openGallery();
  };

  const handleRemovePhoto = () => {
    setAvatar(null);
    closeSheet();
  };

  const pickAvatar = () => {
    Keyboard.dismiss();
    openSheet();
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDob(selectedDate);
        emailRef.current?.focus();
      }
    } else {
      if (selectedDate) setDob(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };
  const openDatePicker = () => {
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

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
        setPreviewAddress(unique.join(', '));
      } else {
        setPreviewAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (err) {
      setPreviewAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const openMapPicker = async () => {
    Keyboard.dismiss();
    setShowMapPicker(true);

    if (locationCoords) {
      const region = {
        ...locationCoords,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setMapRegion(region);
      setMarkerCoordinate(locationCoords);
      reverseGeocode(locationCoords.latitude, locationCoords.longitude);
      return;
    }

    await goToCurrentLocation(DEFAULT_REGION);
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
            'Location Permission Needed',
            'Please enable location access in Settings to use current location.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
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
      Alert.alert('Location Error', 'Could not get your current location.');
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

  const confirmMapLocation = () => {
    setAddress(previewAddress);
    setLocationCoords(markerCoordinate);
    setShowMapPicker(false);
  };

  const isFormValid =
    fullName.trim() &&
    nickname.trim() &&
    dob &&
    email.trim() &&
    phone.trim() &&
    address.trim();

  const handleContinue = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = `${countryCode}${phone}`;
      const signupData = await authApi.signup(fullPhoneNumber);
      await saveToken(signupData.token);
      await authApi.completeProfile(signupData.token, {
        fullName,
        nickname,
        dob,
        email,
        address,
        latitude: locationCoords?.latitude ?? null,
        longitude: locationCoords?.longitude ?? null,
        profileImageUrl: avatar,
      });
      await refreshForUser();
      router.push('/create-pin');
    } catch (err) {
      Alert.alert('Could not create account', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showDatePicker}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Fill Your Profile</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9A9A9A"
          value={fullName}
          onChangeText={setFullName}
          returnKeyType="next"
          onSubmitEditing={() => nicknameRef.current?.focus()}
        />

        <TextInput
          ref={nicknameRef}
          style={styles.input}
          placeholder="Nickname"
          placeholderTextColor="#9A9A9A"
          value={nickname}
          onChangeText={setNickname}
          returnKeyType="next"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            setShowDatePicker(true);
          }}
        />

        <TouchableOpacity
          style={styles.inputRow}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Text style={dob ? styles.inputRowText : styles.placeholderText}>
            {dob ? formatDate(dob) : 'Date of Birth'}
          </Text>
          <Ionicons name="calendar-outline" size={22} color={dob ? '#000' : '#6B6B6B'} />
        </TouchableOpacity>

        {showDatePicker && (
          <View>
            <DateTimePicker
              value={dob || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={onChangeDate}
              themeVariant="light"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.datePickerDoneButton}
                onPress={() => {
                  setShowDatePicker(false);
                  emailRef.current?.focus();
                }}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={emailRef}
            style={styles.inputRowInput}
            placeholder="Email"
            placeholderTextColor="#9A9A9A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
          <Ionicons name="mail-outline" size={22} color={email ? '#000' : '#6B6B6B'} />
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.flagText}>{countryFlag}</Text>
            <Ionicons name="chevron-down" size={14} color="#6B6B6B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TextInput
            ref={phoneRef}
            style={styles.inputRowInput}
            placeholder="Phone Number"
            placeholderTextColor="#9A9A9A"
            value={phone ? `${countryCode} ${phone}` : ''}
            onChangeText={(text) => setPhone(text.replace(countryCode, '').trim())}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => addressRef.current?.focus()}
          />
        </View>
        <View style={styles.inputRow}>
          <TextInput
            ref={addressRef}
            style={styles.inputRowInput}
            placeholder="Address"
            placeholderTextColor="#9A9A9A"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              setLocationCoords(null);
            }}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          <TouchableOpacity onPress={openMapPicker} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={locationCoords ? 'location' : 'location-outline'}
              size={22}
              color={locationCoords ? '#7310FF' : address ? '#000' : '#6B6B6B'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showPhotoOptions && (
        <View style={styles.sheetOverlay} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={closeSheet}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheetContainer,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Update Profile Photo</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionIcon}>
                <Ionicons name="camera-outline" size={22} color="#7310FF" />
              </View>
              <Text style={styles.sheetOptionText}>Take Photo</Text>
              <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleChooseGallery}
              activeOpacity={0.7}
            >
              <View style={styles.sheetOptionIcon}>
                <Ionicons name="images-outline" size={22} color="#7310FF" />
              </View>
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
              <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
            </TouchableOpacity>

            {avatar && (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetOptionIcon, styles.sheetOptionIconDanger]}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </View>
                <Text style={[styles.sheetOptionText, styles.sheetOptionTextDanger]}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={closeSheet}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <CountryPicker
        show={showCountryPicker}
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code);
          setCountryFlag(item.flag);
          setShowCountryPicker(false);
        }}
        onBackdropPress={() => setShowCountryPicker(false)}
        lang="en"
        style={{
          modal: { height: 500 },
        }}
        keyboardShouldPersistTaps="handled"
      />

      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.mapContainer}>
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
            <Marker
              coordinate={markerCoordinate}
              draggable
              onDragEnd={handleMarkerDragEnd}
              pinColor="#7310FF"
            />
          </MapView>

          <TouchableOpacity
            style={styles.mapBackButton}
            onPress={() => setShowMapPicker(false)}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapCurrentLocationButton}
            onPress={() => goToCurrentLocation(mapRegion)}
            disabled={isLocating}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#7310FF" />
            ) : (
              <Ionicons name="navigate-outline" size={22} color="#7310FF" />
            )}
          </TouchableOpacity>

          <View style={styles.mapBottomCard}>
            <Text style={styles.mapAddressLabel}>Selected Location</Text>
            {isReverseGeocoding ? (
              <View style={styles.mapAddressLoadingRow}>
                <ActivityIndicator size="small" color="#7310FF" />
                <Text style={styles.mapAddressLoadingText}>Finding address…</Text>
              </View>
            ) : (
              <Text style={styles.mapAddressText} numberOfLines={2}>
                {previewAddress || 'Move the map to drop a pin'}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!previewAddress || isReverseGeocoding) && styles.primaryButtonDisabled,
              ]}
              onPress={confirmMapLocation}
              disabled={!previewAddress || isReverseGeocoding}
            >
              <Text style={styles.primaryButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { marginRight: 12 },
  title: { fontFamily: 'Roboto_800ExtraBold', fontSize: 28, fontWeight: '800', color: '#000000' },
  avatarWrapper: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 110, height: 110, position: 'relative' },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' },
  avatarHead: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#B0B0B0', marginTop: 22 },
  avatarBody: { width: 82, height: 60, borderRadius: 41, backgroundColor: '#B0B0B0', marginTop: 8 },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#7310FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 18, fontSize: 15, color: '#000', marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 20 },
  inputRowText: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 14 },
  placeholderText: { flex: 1, fontSize: 15, color: '#9A9A9A', paddingVertical: 14 },
  inputRowInput: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 14 },
  countrySelector: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  flagText: { fontSize: 18 },
  divider: { width: 1, height: 20, backgroundColor: '#D8D8D8', marginRight: 10 },
  primaryButton: { backgroundColor: '#7310FF', borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 30 },
  primaryButtonDisabled: { backgroundColor: '#C9A8FF' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  datePickerDoneButton: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, marginBottom: 10 },
  datePickerDoneText: { color: '#7310FF', fontWeight: '600', fontSize: 16 },
  sheetOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 18 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sheetOptionIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  sheetOptionText: { flex: 1, fontSize: 15, color: '#000', fontWeight: '500' },
  sheetOptionIconDanger: { backgroundColor: '#FFEAEA' },
  sheetOptionTextDanger: { color: '#FF3B30' },
  sheetCancelButton: { marginTop: 16, paddingVertical: 14, borderRadius: 30, backgroundColor: '#F5F5F5', alignItems: 'center' },
  sheetCancelText: { fontSize: 15, fontWeight: '600', color: '#000' },
  mapContainer: { flex: 1, backgroundColor: '#fff' },
  centerPinWrapper: {position: 'absolute',top: '50%',left: '50%',marginLeft: -20,marginTop: -40,alignItems: 'center',},
  centerPinShadow: {width: 8,height: 4,borderRadius: 4,backgroundColor: 'rgba(0,0,0,0.25)',marginTop: -2,},
  mapBackButton: {position: 'absolute',top: 55,left: 20,width: 40,height: 40,borderRadius: 20,backgroundColor: '#fff',alignItems: 'center',justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  mapCurrentLocationButton: {
    position: 'absolute',
    top: 55,
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
  mapBottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  mapAddressLabel: { fontSize: 12, fontWeight: '600', color: '#9A9A9A', marginBottom: 6, textTransform: 'uppercase' },
  mapAddressText: { fontSize: 15, color: '#000', fontWeight: '500', minHeight: 40 },
  mapAddressLoadingRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
  mapAddressLoadingText: { marginLeft: 8, fontSize: 14, color: '#6B6B6B' },
});