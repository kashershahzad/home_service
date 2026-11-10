import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

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
    if (!slug) {
      router.replace("/home");
      return;
    }

    if (
      slug === "home-cleaning" ||
      slug.includes("clean") ||
      slug === "laundry"
    ) {
      router.replace("/booking/propertyBooking");
      return;
    }

    if (
      slug === "hair-dressing" ||
      slug.includes("hair") ||
      slug.includes("beauty") ||
      slug.includes("salon")
    ) {
      router.replace({
        pathname: "/booking/bookHaircutService",
        params: { categorySlug: slug },
      });
      return;
    }

    router.replace("/booking/propertyBooking");
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
