import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { images } from "../../assets/images/image";
import fonts from "../assets/fonts";
import CustomText from "./CustomText";

const TAG_STYLES = {
  trending: {
    backgroundColor: "#14332CCC",
    color: "#A7F3D0",
  },
  popular: {
    backgroundColor: "#059669E5",
    color: "#FFFFFF",
  },
  express: {
    backgroundColor: "#047857",
    color: "#FFFFFF",
  },
  topRated: {
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
  },
};

const PopularServiceCard = ({ item, onPress, style }) => {
  const tagStyle = TAG_STYLES[item.tagColor] || TAG_STYLES.popular;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.imageWrap}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.ratingBadge}>
          <Image source={images.ratingIcon} style={{ width: 9, height: 8 }} />
          <CustomText
            label={String(item.rating)}
            fontSize={10}
            fontFamily={fonts.bold}
            color="#065F46"
          />
        </View>
        <View
          style={[
            styles.tagBadge,
            { backgroundColor: tagStyle.backgroundColor },
          ]}
        >
          <CustomText
            label={item.tag}
            fontSize={10}
            fontFamily={fonts.semiBold}
            color={tagStyle.color}
          />
        </View>
      </View>

      <View style={styles.content}>
        <CustomText
          label={item.title}
          fontSize={14}
          fontFamily={fonts.extraBold}
          color="#14332C"
        />
        <CustomText
          label={item.subtitle}
          fontSize={11}
          fontFamily={fonts.medium}
          color="#637C75"
          marginTop={2}
        />

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <CustomText
              label="From   Rs "
              fontSize={12}
              fontFamily={fonts.bold}
              color="#14332C"
            />
            <CustomText
              label={item.price}
              fontSize={12}
              fontFamily={fonts.bold}
              color="#14332C"
            />
          </View>
          <View style={styles.arrowBtn}>
            <Image source={images.rightarrow2} style={styles.arrowIcon} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PopularServiceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#064E3B0F",
    shadowColor: "#064E3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    height: 218,
    width: "48%",
  },
  imageWrap: {
    width: "100%",
    height: 110,
  },
  image: {
    width: "100%",
    height: 112,
    resizeMode: "cover",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  tagBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#F0F9F6",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    width: 10,
    height: 10,
    resizeMode: "contain",
    tintColor: "#0E6E4C",
  },
});
