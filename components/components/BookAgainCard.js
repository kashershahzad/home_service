import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { images } from "../../assets/images/image";
import fonts from "../assets/fonts";
import CustomText from "./CustomText";

const BookAgainCard = ({ item, onRebook }) => {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <CustomText
            label={item.initials}
            fontSize={14}
            fontFamily={fonts.bold}
            color="#0E6E4C"
            removeTranslation
          />
        </View>
        <Image source={images.tick} style={styles.tickIcon} />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <CustomText
            label={item.name}
            fontSize={14}
            fontFamily={fonts.bold}
            color="#14332C"
            removeTranslation
          />
          <View style={styles.ratingBadge}>
            <CustomText
              label={String(item.rating)}
              fontSize={11}
              fontFamily={fonts.semiBold}
              color="#D97706"
              removeTranslation
            />
            <Image source={images.ratingIcon} style={styles.starIcon} />
          </View>
        </View>

        <CustomText
          label={item.service}
          fontSize={12}
          fontFamily={fonts.medium}
          color="#6B7C76"
          marginTop={2}
          removeTranslation
        />
        <CustomText
          label={`${item.status} · ${item.date}`}
          fontSize={11}
          fontFamily={fonts.medium}
          color="#6B7C76"
          marginTop={2}
          removeTranslation
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onRebook}
        style={styles.rebookBtn}
      >
        <Image source={images.rebook} style={styles.rebookIcon} />
        <CustomText
          label="Rebook"
          fontSize={12}
          fontFamily={fonts.bold}
          color="#FFFFFF"
          removeTranslation
        />
      </TouchableOpacity>
    </View>
  );
};

export default BookAgainCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3FAF6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#064E3B14",
    padding: 12,
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D8F3E5",
    alignItems: "center",
    justifyContent: "center",
  },
  tickIcon: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7B2",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  starIcon: {
    width: 9,
    height: 8,
    resizeMode: "contain",
  },
  rebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#064E3B",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rebookIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
});
