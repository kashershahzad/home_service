import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "../../utils/api";
import { getBookingRoute } from "../../utils/bookingNav";

/**
 * Redirect only — booking UI already lives in:
 * - /booking/propertyBooking  (home-cleaning)
 * - /booking/bookHaircutService (hair-dressing)
 */
export default function CategoryRedirect() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const slug = String(Array.isArray(name) ? name[0] : name || "").toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!slug) {
        router.replace("/home");
        return;
      }

      const token = await getToken();
      if (!mounted) return;
      if (!token) {
        router.replace("/letYouIn");
        return;
      }

      router.replace(getBookingRoute({ slug, id: slug, title: slug }));
    })();

    return () => {
      mounted = false;
    };
  }, [slug, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F6FAF8",
      }}
    >
      <ActivityIndicator color="#0E6E4C" />
    </View>
  );
}
