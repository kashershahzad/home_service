import { useRouter } from "expo-router";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangeAddressForm from "../components/ChangeAddressForm";

export default function ChangeAddressScreen() {
  const router = useRouter();

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/profile");

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ChangeAddressForm
        title="Change Address"
        onCancel={goBack}
        onSaved={() => {
          Alert.alert("Saved", "Your address has been updated.", [
            { text: "OK", onPress: goBack },
          ]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6FAF8" },
});
