import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { images } from "../../assets/images/image";
import fonts from "../assets/fonts";
import CustomText from "./CustomText";

const LimitedOfferCard = ({
  discount = "30% OFF",
  subtitle = "Premium Home Cleaning & Styling",
  buttonLabel = "Claim Offer",
  onPress,
  activeIndex = 0,
  totalDots = 3,
}) => {
  return (
    <LinearGradient
      colors={["#14332C", "#0E6E4C", "#0A4B34"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={styles.badge}>
            <Image source={images.limitedoffer} style={styles.badgeIcon} />
            <CustomText
              label="LIMITED OFFER"
              fontSize={10}
              fontFamily={fonts.bold}
              color="#FDB827"
              removeTranslation
            />
          </View>

          <CustomText
            label={discount}
            fontSize={28}
            fontFamily={fonts.extraBold}
            color="#FFFFFF"
            marginTop={5}
            removeTranslation
          />
          <CustomText
            label={subtitle}
            fontSize={12}
            fontFamily={fonts.medium}
            color="#D1FAE5"
            removeTranslation
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.claimBtn}
          >
            <CustomText
              label={buttonLabel}
              fontSize={13}
              fontFamily={fonts.bold}
              color="#14332C"
              removeTranslation
            />
            <Image source={images.rightarrow2} style={styles.claimArrow} />
          </TouchableOpacity>

          <View style={styles.dots}>
            {Array.from({ length: totalDots }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.rightDecor}>
          <View style={styles.glassCard}>
            <CustomText
              label="SAVE BIG"
              fontSize={13}
              fontFamily={fonts.extraBold}
              color="#FFFFFF"
              textAlign="center"
              removeTranslation
            />
            <CustomText
              label="Instant Discount"
              fontSize={10}
              fontFamily={fonts.medium}
              color="rgba(255,255,255,0.85)"
              textAlign="center"
              marginTop={2}
              removeTranslation
            />
          </View>
          <View style={styles.percentBadge}>
            <CustomText
              label="%"
              fontSize={14}
              fontFamily={fonts.bold}
              color="#14332C"
              removeTranslation
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default LimitedOfferCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
    paddingRight: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FCD34D4D",
    backgroundColor: "#FBBF2433",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#FDB827",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
  },
  claimArrow: {
    width: 10,
    height: 10,
    resizeMode: "contain",
    tintColor: "#14332C",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FDB827",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  rightDecor: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  glassCard: {
    width: 100,
    height: 100,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "8deg" }],
    paddingHorizontal: 8,
  },
  percentBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDB827",
    alignItems: "center",
    justifyContent: "center",
  },
});
