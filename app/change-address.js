import { useRouter } from "expo-router";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangeAddressForm from "../components/ChangeAddressForm";

export default function ChangeAddressScreen() {
  const router = useRouter();

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/profile");

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6FAF8"
        translucent={false}
      />
      <ChangeAddressForm
        title="My Addresses"
        onCancel={goBack}
        onSaved={() => {
          // Stay on screen so user can add multiple addresses.
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6FAF8" },
});
