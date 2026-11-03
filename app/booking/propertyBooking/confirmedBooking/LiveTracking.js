import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { images } from "../../../../assets/images/image";
import fonts from "../../../../components/assets/fonts";
import CustomText from "../../../../components/components/CustomText";
import Icons from "../../../../components/components/Icons";
import ScreenWrapper from "../../../../components/components/ScreenWrapper";
import TrackingMap from "./TrackingMap";

const ACCENT = "#0E6E4C";
const TEXT = "#17121F";
const MUTED = "#6F6878";
const PURPLE = "#6E5C9A";
const PURPLE_BG = "#F3EEFF";

function formatArrivalWindow(schedule) {
  const range = (
    schedule?.timeRange ||
    schedule?.displayTime ||
    "2:00 – 2:05 PM"
  ).replace(/\s*[–-]\s*/g, " – ");
  return range;
}

export default function LiveTracking({ schedule, onBack }) {
  const arrival = formatArrivalWindow(schedule);

  return (
    <ScreenWrapper
      backgroundColor="#FFFFFF"
      statusBarColor="#FFFFFF"
      paddingHorizontal={0}
      scrollEnabled={false}
      headerUnScrollable={() => (
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <View style={styles.backSlot}>
              <Icons
                family="Ionicons"
                name="chevron-back"
                size={24}
                color={TEXT}
                onPress={onBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              />
            </View>
            <CustomText
              label="House Cleaning"
              fontFamily={fonts.bold}
              fontSize={17}
              color={TEXT}
              textAlign="center"
              width="100%"
              containerStyle={styles.headerTitle}
            />
            <View style={styles.backSlot} />
          </View>

          <View style={styles.arrivalCard}>
            <Image
              source={images.confirmedBookingTime}
              style={styles.arrivalIcon}
              resizeMode="contain"
            />
            <Text style={styles.arrivalText}>
              Expected arrival between{" "}
              <Text style={styles.arrivalValue}>{arrival}</Text>
            </Text>
          </View>
        </View>
      )}
      footerUnScrollable={() => (
        <View style={styles.teamCard}>
          <Image
            source={images.homecard1}
            style={styles.avatar}
            resizeMode="cover"
          />
          <CustomText
            label="Ayesha & Hamza"
            fontFamily={fonts.bold}
            fontSize={18}
            color={TEXT}
            textAlign="center"
            alignSelf="center"
            marginTop={12}
          />
          <View style={styles.ratingRow}>
            <Icons family="Ionicons" name="star" size={14} color="#F5B400" />
            <Text style={styles.ratingText}>4.9 (320 jobs completed)</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.85}>
              <Icons family="Ionicons" name="call-outline" size={16} color={PURPLE} />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85}>
              <Icons
                family="Ionicons"
                name="chatbubble-ellipses-outline"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    >
      <View style={styles.mapWrap}>
        <TrackingMap />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  backSlot: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
  },
  arrivalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E5ED",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  arrivalIcon: {
    width: 18,
    height: 18,
    tintColor: ACCENT,
  },
  arrivalText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: TEXT,
  },
  arrivalValue: {
    color: ACCENT,
    fontFamily: fonts.semiBold,
  },
  mapWrap: {
    flex: 1,
    marginTop: 4,
  },
  teamCard: {
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8E5ED",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PURPLE_BG,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: MUTED,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 16,
  },
  callBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: PURPLE_BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  callText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: PURPLE,
  },
  messageBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  messageText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#FFFFFF",
  },
});
