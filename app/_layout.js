import { Roboto_800ExtraBold } from "@expo-google-fonts/roboto";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { customFonts } from "../components/assets/fonts";
import { BookmarkProvider } from "../context/BookmarkContext";
import { persistor, store } from "../store";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...customFonts,
    Roboto_800ExtraBold,
  });

  useEffect(() => {
    Asset.loadAsync([
      require("../assets/images/onboarding/onboarding1.png"),
      require("../assets/images/onboarding/onboarding2.png"),
      require("../assets/images/onboarding/onboarding3.png"),
      require("../assets/images/login-illustration.png"),
      require("../assets/images/fingerprint.png"),
      require("../assets/images/not-found.png"),
    ]);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BookmarkProvider>
          <View style={{ flex: 1, backgroundColor: "#F6FAF8" }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </BookmarkProvider>
      </PersistGate>
    </Provider>
  );
}
