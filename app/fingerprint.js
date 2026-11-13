import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ScreenWrapper from "../components/components/ScreenWrapper";
import { setUserData } from "../store/reducer/usersSlice";
import { authApi, getToken } from "../utils/api";
import { goHomeAfterAuth } from "../utils/authNav";
import {
  clearBiometricCredentials,
  getBiometricCapability,
  getBiometricCredentials,
  saveBiometricCredentials,
} from "../utils/biometric";

const PURPLE = "#7310FF";
const DECOR_DOTS = [
  { top: -14, left: 22, size: 12, opacity: 0.9 },
  { top: 8, left: 0, size: 8, opacity: 0.6 },
  { top: -24, left: 74, size: 9, opacity: 0.7 },
  { top: -8, left: 122, size: 14, opacity: 0.9 },
  { top: 18, left: 160, size: 8, opacity: 0.6 },
  { top: -20, left: 188, size: 10, opacity: 0.8 },
  { top: 58, left: -10, size: 7, opacity: 0.5 },
  { top: 72, left: 200, size: 7, opacity: 0.5 },
  { top: 100, left: -4, size: 5, opacity: 0.4 },
  { top: 104, left: 202, size: 5, opacity: 0.4 },
];

export default function SetFingerprintScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { mode } = useLocalSearchParams();
  const isUpdate = mode === "update";
  const user = useSelector((state) => state.users.userData);

  const [showSuccess, setShowSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [capability, setCapability] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getBiometricCapability().then(setCapability);
  }, []);

  useEffect(() => {
    let loop;
    if (showSuccess) {
      spinValue.setValue(0);
      loop = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [showSuccess, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const isFaceId = !!capability?.isFaceId;
  const label = capability?.label || "Biometric";

  const finish = () => {
    if (isUpdate) {
      if (router.canGoBack()) router.back();
      else router.replace("/profile");
      return;
    }
    goHomeAfterAuth(router, navigation);
  };

  const goHomeAfterSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      finish();
    }, 1600);
  };

  const syncUserBiometric = async (enabled) => {
    const token = await getToken();
    if (!token) throw new Error("Session expired. Please sign in again.");

    // Same as Postman: PUT /api/auth/enable-biometric { enabled: true }
    await authApi.enableBiometric(token, enabled);

    let nextUser = user ? { ...user, biometricEnabled: enabled } : null;
    try {
      const profile = await authApi.getMe(token);
      nextUser = profile?.user || profile || nextUser;
      if (nextUser) {
        nextUser = { ...nextUser, biometricEnabled: enabled };
      }
    } catch (_) {}

    if (nextUser) dispatch(setUserData(nextUser));
    return nextUser;
  };

  const handleSetBiometric = async () => {
    if (scanning) return;
    setScanning(true);
    try {
      const cap = capability || (await getBiometricCapability());
      setCapability(cap);

      if (!cap.available) {
        Alert.alert(
          "Not available",
          "This device does not support Face ID or fingerprint.",
        );
        return;
      }
      if (!cap.enrolled) {
        Alert.alert(
          `No ${cap.label} in phone settings`,
          `Pehle iPhone Settings → Face ID & Passcode mein ${cap.label} on karo. App sirf flag save karti hai — match login pe hota hai.`,
        );
        return;
      }

      // Postman jaisa: sirf enable flag true — Face ID match yahan nahi,
      // match tab hoga jab user next time sign-in pe biometric use kare.
      const nextUser = await syncUserBiometric(true);
      const phone = nextUser?.phone || user?.phone;
      const existing = await getBiometricCredentials();
      await saveBiometricCredentials(phone, existing.pin || null);

      goHomeAfterSuccess();
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not enable biometric.");
    } finally {
      setScanning(false);
    }
  };

  const handleSkip = () => {
    finish();
  };

  const handleDisable = () => {
    Alert.alert("Disable biometric", "Turn off biometric login for this account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disable",
        style: "destructive",
        onPress: async () => {
          setScanning(true);
          try {
            await syncUserBiometric(false);
            await clearBiometricCredentials();
            Alert.alert("Done", "Biometric login disabled.");
            finish();
          } catch (err) {
            Alert.alert("Error", err?.message || "Could not update.");
          } finally {
            setScanning(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper
      backgroundColor="#F6FAF8"
      statusBarColor="#F6FAF8"
      paddingHorizontal={24}
      scrollEnabled
    >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Set Biometric</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          {isFaceId
            ? "Use Face ID to make your account more secure"
            : "Use fingerprint to make your account more secure"}
        </Text>

        <View style={styles.fingerprintWrap}>
          {isFaceId ? (
            <View style={styles.faceIconWrap}>
              <Ionicons name="scan" size={140} color={PURPLE} />
              <Ionicons
                name="happy-outline"
                size={64}
                color={PURPLE}
                style={styles.faceInnerIcon}
              />
            </View>
          ) : (
            <Image
              source={require("../assets/images/fingerprint.png")}
              style={styles.fingerprintImage}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={styles.helperText}>
          {!capability
            ? "Checking device biometric…"
            : !capability.available
              ? "Biometric hardware not found on this device."
              : !capability.enrolled
                ? `Pehle phone Settings mein ${label} on karo.`
                : `Tap Set Biometric to turn it on. ${label} scan only happens at sign-in.`}
        </Text>

        <View style={styles.footer}>
          {isUpdate && user?.biometricEnabled ? (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleDisable}
              disabled={scanning}
            >
              <Text style={styles.skipText}>Disable</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={scanning}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              scanning && styles.continueButtonDisabled,
            ]}
            onPress={handleSetBiometric}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.continueText}>Set Biometric</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.decorWrap}>
                {DECOR_DOTS.map((dot, i) => (
                  <View
                    key={i}
                    style={[
                      styles.decorDot,
                      {
                        top: dot.top,
                        left: dot.left,
                        width: dot.size,
                        height: dot.size,
                        borderRadius: dot.size / 2,
                        opacity: dot.opacity,
                      },
                    ]}
                  />
                ))}
                <View style={styles.modalIconCircle}>
                  <Ionicons
                    name={isFaceId ? "scan" : "finger-print"}
                    size={50}
                    color="#fff"
                  />
                </View>
              </View>

              <Text style={styles.congratsTitle}>Biometric Enabled</Text>
              <Text style={styles.congratsText}>
                {label} is now on for your account (biometricEnabled: true).
              </Text>

              <Animated.Image
                source={require("../assets/images/loader-dots.png")}
                style={[styles.loaderDots, { transform: [{ rotate: spin }] }]}
                resizeMode="contain"
              />
            </View>
          </View>
        </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 26,
  },
  headerSpacer: {
    width: 26,
  },
  title: {
    flex: 1,
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
  },
  fingerprintWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    marginBottom: 0,
  },
  faceIconWrap: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#F1E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  faceInnerIcon: {
    position: "absolute",
  },
  fingerprintImage: {
    width: 400,
    height: 400,
  },
  helperText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    marginBottom: 60,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#ECECEC",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  skipText: {
    color: PURPLE,
    fontWeight: "600",
    fontSize: 15,
  },
  continueButton: {
    flex: 1.3,
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: "#B48CFF",
  },
  continueText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 420,
  },
  decorWrap: {
    width: 200,
    height: 130,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  decorDot: {
    position: "absolute",
    backgroundColor: PURPLE,
  },
  modalIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PURPLE,
    justifyContent: "center",
    alignItems: "center",
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PURPLE,
    marginBottom: 12,
  },
  congratsText: {
    fontSize: 15,
    color: "#000",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  loaderDots: {
    width: 34,
    height: 34,
    marginTop: 26,
  },
});
