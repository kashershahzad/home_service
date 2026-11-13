import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import ScreenWrapper from "../components/components/ScreenWrapper";
import { redirectIfAuthenticated } from "../utils/authNav";
import { buildE164Phone } from "../utils/phone";

export default function SignInNumberScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [countryCode, setCountryCode] = useState("+92");
  const [countryFlag, setCountryFlag] = useState("🇵🇰");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      redirectIfAuthenticated(router, navigation);
    }, [router, navigation]),
  );

  const handlePhoneChange = (text) => {
    if (/^[0-9]*$/.test(text)) {
      setPhone(text);
    } else {
      setPhone(text.replace(/[^0-9]/g, ""));
    }
    if (error) setError("");
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    setError("");
    const fullNumber = buildE164Phone(countryCode, phone);
    router.push({
      pathname: "/login-pin",
      params: { phone: fullNumber },
    });
  };

  return (
    <ScreenWrapper
      backgroundColor="#F6FAF8"
      statusBarColor="#F6FAF8"
      paddingHorizontal={24}
      scrollEnabled
      footerUnScrollable={() => (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Sign in with Phone</Text>

      <Text style={styles.label}>Phone Number</Text>
      <View
        style={[
          styles.phoneInputWrapper,
          error ? styles.phoneInputWrapperError : null,
        ]}
      >
        <TouchableOpacity
          style={styles.flagSection}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.flag}>{countryFlag}</Text>
          <Ionicons name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>

        <Text style={styles.countryCode}>{countryCode}</Text>

        <TextInput
          style={styles.phoneInput}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          returnKeyType="done"
          value={phone}
          onChangeText={handlePhoneChange}
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <CountryPicker
        show={showPicker}
        pickerButtonOnPress={(item) => {
          Keyboard.dismiss();
          setCountryCode(item.dial_code);
          setCountryFlag(item.flag);
          setShowPicker(false);
          setPhone("");
          setError("");
        }}
        onBackdropPress={() => setShowPicker(false)}
        lang="en"
        style={{
          modal: {
            height: 500,
          },
          countryButtonStyles: {
            height: 40,
            borderRadius: 0,
            backgroundColor: "transparent",
            borderBottomWidth: 0,
            marginVertical: 0,
            paddingVertical: 4,
            paddingHorizontal: 16,
            shadowOpacity: 0,
            elevation: 0,
            justifyContent: "flex-start",
          },
          flag: {
            marginRight: -30,
          },
          dialCode: {
            color: "#000",
            marginRight: -20,
            minWidth: 0,
          },
          countryName: {
            color: "#000",
            fontSize: 14,
            marginLeft: 0,
          },
        }}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backButton: { marginBottom: 24, marginTop: 4, alignSelf: "flex-start" },
  title: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 45,
    color: "#000000",
    marginBottom: 40,
  },
  label: { fontSize: 14, color: "#000000", marginBottom: 12 },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderWidth: 1,
    borderColor: "#F4F4F4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  phoneInputWrapperError: { borderColor: "#FF3B30" },
  flagSection: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  flag: { fontSize: 18, marginRight: 4 },
  countryCode: { fontSize: 15, color: "#000", marginRight: 8 },
  phoneInput: { flex: 1, fontSize: 15, color: "#000" },
  errorText: { color: "#FF3B30", fontSize: 13, marginTop: 6, marginBottom: 10 },
  primaryButton: {
    backgroundColor: "#7310FF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  footerText: { color: "#000" },
  footerLink: { color: "#7310FF", fontWeight: "600" },
});
