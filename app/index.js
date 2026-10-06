import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout as logoutAuth, setToken } from "../store/reducer/AuthConfig";
import { clearUserData, setUserData } from "../store/reducer/usersSlice";
import { authApi, deleteToken, getToken } from "../utils/api";

const MIN_SPLASH_TIME = 2500;

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const startTime = Date.now();

    const checkAuthAndNavigate = async () => {
      let destination = "/landing";

      try {
        const token = await getToken();

        if (token) {
          try {
            const data = await authApi.getMe(token);
            const user = data?.user || data;

            dispatch(setToken(token));
            dispatch(setUserData(user));

            if (user.profileCompleted && user.pinSet) {
              destination = "/home";
            } else if (!user.profileCompleted) {
              destination = "/signup";
            } else if (!user.pinSet) {
              destination = "/create-pin";
            }
          } catch (err) {
            await deleteToken();
            dispatch(logoutAuth());
            dispatch(clearUserData());
            destination = "/landing";
          }
        }
      } catch (err) {
        destination = "/landing";
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(MIN_SPLASH_TIME - elapsed, 0);

      setTimeout(() => {
        router.replace(destination);
      }, remaining);
    };

    checkAuthAndNavigate();
  }, [dispatch, router]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Animated.Image
        source={require("../assets/images/loader-dots.png")}
        style={[styles.dotsLoader, { transform: [{ rotate: spin }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FAF8",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 380,
    marginBottom: 40,
  },
  dotsLoader: {
    width: 55,
    height: 55,
    marginTop: 60,
  },
});
