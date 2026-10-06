import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, getToken } from "../utils/api";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#EEEEEE",
  inputBg: "#F5F5F5",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert("Error", "Please sign in again.");
          router.replace("/letYouIn");
          return;
        }
        const profile = await authApi.getMe(token);
        const user = profile?.user || profile;
        if (!mounted) return;
        setAvatar(user?.profileImageUrl || null);
        setFullName(user?.fullName || "");
        setNickname(user?.nickname || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || "");
        setAddress(user?.address || "");
      } catch (err) {
        Alert.alert("Error", err?.message || "Could not load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  const pickAvatar = () => {
    Alert.alert("Update Photo", "Choose a source", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission Needed",
              "Please enable camera access in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setAvatar(result.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission Needed",
              "Please enable photo access in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setAvatar(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing info", "Full name is required.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in again.");

      await authApi.completeProfile(token, {
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        email: email.trim(),
        address: address.trim(),
        profileImageUrl: avatar,
      });

      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || nickname || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            hitSlop={HIT_SLOP}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.85}
            onPress={pickAvatar}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Field
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            icon="person-outline"
          />
          <Field
            label="Nickname"
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nickname"
            icon="at-outline"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone"
            value={phone}
            editable={false}
            placeholder="Phone number"
            icon="call-outline"
          />
          <Field
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Your address"
            icon="location-outline"
            multiline
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize,
  editable = true,
  multiline = false,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.primary}
          style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }}
        />
        <TextInput
          style={[styles.input, multiline && { minHeight: 70 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 22,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Roboto_800ExtraBold",
    fontSize: 36,
    color: COLORS.primary,
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.subtext,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputDisabled: {
    backgroundColor: COLORS.inputBg,
  },
  inputMultiline: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
