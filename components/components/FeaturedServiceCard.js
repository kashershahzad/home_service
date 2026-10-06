import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { images } from "../../assets/images/image";
import fonts from "../assets/fonts";
import CustomText from "./CustomText";

const FeaturedServiceCard = ({ item, onPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.tag}>
          <CustomText
            label={item.tag}
            fontSize={10}
            fontFamily={fonts.medium}
            color="#005445"
            removeTranslation
          />
        </View>
        <View style={styles.priceBadge}>
          <CustomText
            label={item.price}
            fontSize={11}
            fontFamily={fonts.semiBold}
            color="#FFFFFF"
            removeTranslation
          />
        </View>
      </View>

      <View style={styles.content}>
        <CustomText
          label={item.title}
          fontSize={18}
          fontFamily={fonts.bold}
          color="#181D1C"
          removeTranslation
        />
        <CustomText
          label={item.description}
          fontSize={13}
          fontFamily={fonts.regular}
          color="#3E4945"
          marginTop={6}
          lineHeight={20}
          removeTranslation
        />

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Image source={images.rating2} style={styles.star} />
            <CustomText
              label={String(item.rating)}
              fontSize={12}
              fontFamily={fonts.bold}
              color="#634309"
              removeTranslation
            />
            <CustomText
              label={`(${item.reviews})`}
              fontSize={11}
              fontFamily={fonts.regular}
              color="#3E4945"
              removeTranslation
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={styles.bookingBtn}
          >
            <CustomText
              label="Booking"
              fontSize={12}
              fontFamily={fonts.semiBold}
              color="#005445"
              removeTranslation
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FeaturedServiceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EEEB",
  },
  imageWrap: {
    width: "100%",
    height: 170,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#C8EADFE5",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#00544533",
  },
  priceBadge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#2C3130CC",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E9E7",
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  star: {
    width: 12,
    height: 11,
    resizeMode: "contain",
  },
  bookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAEFED",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  arrow: {
    width: 10,
    height: 10,
    resizeMode: "contain",
    tintColor: "#0E6E5C",
  },
});
