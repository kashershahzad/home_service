import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "../../utils/api";
import { getBookingRoute } from "../../utils/bookingNav";

/**
 * Service detail removed — redirect straight to booking (or login if guest).
 */
export default function ServiceDetailRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await getToken();
      if (!mounted) return;

      if (!token) {
        router.replace("/letYouIn");
        return;
      }

      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      const title = Array.isArray(params.title)
        ? params.title[0]
        : params.title;
      const name = Array.isArray(params.name) ? params.name[0] : params.name;
      const bookingFlow = Array.isArray(params.bookingFlow)
        ? params.bookingFlow[0]
        : params.bookingFlow;

      const route = getBookingRoute({
        id,
        slug: slug || id,
        title,
        name,
        bookingFlow,
      });

      router.replace(route);
    })().finally(() => {
      if (mounted) setChecking(false);
    });

    return () => {
      mounted = false;
    };
  }, [params, router]);

  if (!checking) return null;

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
