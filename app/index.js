import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const MIN_SPLASH_TIME = 2500;
/** Teal from Easy App icon */
const ICON_TEAL = "#00C2AB";

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const fade = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0.35,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const startTime = Date.now();

    const checkAuthAndNavigate = async () => {
      let destination = "/home";

      // Auth flow (re-enable later if needed):
      // let destination = "/landing";
      // try {
      //   const token = await getToken();
      //   if (token) {
      //     try {
      //       const data = await authApi.getMe(token);
      //       const user = data?.user || data;
      //       dispatch(setToken(token));
      //       dispatch(setUserData(user));
      //       if (user.profileCompleted && user.pinSet) {
      //         destination = "/home";
      //       } else if (!user.profileCompleted) {
      //         destination = "/signup";
      //       } else if (!user.pinSet) {
      //         destination = "/create-pin";
      //       }
      //     } catch (err) {
      //       await deleteToken();
      //       dispatch(logoutAuth());
      //       dispatch(clearUserData());
      //       destination = "/landing";
      //     }
      //   }
      // } catch (err) {
      //   destination = "/landing";
      // }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(MIN_SPLASH_TIME - elapsed, 0);

      setTimeout(() => {
        router.replace(destination);
      }, remaining);
    };

    checkAuthAndNavigate();
  }, [dispatch, fade, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Animated.View style={[styles.loaderWrap, { opacity: fade }]}>
        <ActivityIndicator size="large" color={ICON_TEAL} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 40,
  },
  loaderWrap: {
    marginTop: 24,
  },
});
