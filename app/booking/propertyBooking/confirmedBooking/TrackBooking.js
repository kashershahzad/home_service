import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { images } from "../../../../assets/images/image";
import fonts from "../../../../components/assets/fonts";
import CustomButton from "../../../../components/components/CustomButton";
import CustomText from "../../../../components/components/CustomText";
import Icons from "../../../../components/components/Icons";
import ScreenWrapper from "../../../../components/components/ScreenWrapper";

const ACCENT = "#0E6E4C";
const PURPLE_BG = "#F3EEFF";
const TEXT = "#17121F";
const MUTED = "#6F6878";
const CARD_BORDER = "#E8E5ED";

const PLANS = {
  standard: {
    serviceType: "Standard Clean",
    allocation: "2 Cleaners · 3h",
  },
  deep: {
    serviceType: "Deep Clean",
    allocation: "2 Cleaners · 5h",
  },
  moveout: {
    serviceType: "Move-out Clean",
    allocation: "3 Cleaners · 6h",
  },
};

const DEFAULT_ADDRESS = "House #123, Street 5, Block B, Faisalabad";

function formatArrivalTime(schedule) {
  return (
    schedule?.timeRange ||
    schedule?.displayTime ||
    "2:00–2:15 PM"
  ).replace(/\s*[–-]\s*/g, "–");
}

export default function TrackBooking({
  serviceId = "standard",
  schedule,
  bookingId = "HC8427391",
  onBack,
  onNext,
}) {
  const router = useRouter();
  const plan = PLANS[serviceId] || PLANS.standard;
  const address = schedule?.address?.line || DEFAULT_ADDRESS;
  const arrival = formatArrivalTime(schedule);
  const bookingLabel = `#${bookingId}`;

  return (
    <ScreenWrapper
      backgroundColor="#FFFFFF"
      statusBarColor="#FFFFFF"
      paddingHorizontal={20}
      scrollEnabled={false}
      headerUnScrollable={() => (
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
      )}
      footerUnScrollable={() => (
        <View style={styles.footer}>
          <CustomButton
            title="Next"
            onPress={onNext}
            backgroundColor={ACCENT}
            color="#FFFFFF"
            height={54}
            borderRadius={12}
            fontSize={16}
            fontFamily={fonts.semiBold}
          />
          <Text style={styles.supportText}>
            Need to make changes?{" "}
            <Text
              style={styles.supportLink}
              onPress={() => router.push("/contact-us")}
            >
              Contact Support
            </Text>
          </Text>
        </View>
      )}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <Image
            source={images.radar}
            style={styles.radar}
            resizeMode="contain"
          />
          <CustomText
            label="We’re assigning your cleaning team"
            fontFamily={fonts.bold}
            fontSize={20}
            color={TEXT}
            textAlign="center"
            alignSelf="center"
            marginTop={8}
            containerStyle={styles.statusTitle}
          />
          <CustomText
            label="We’re finding the best available cleaners for your booking."
            fontFamily={fonts.regular}
            fontSize={14}
            color={MUTED}
            textAlign="center"
            alignSelf="center"
            lineHeight={20}
            marginTop={8}
            containerStyle={styles.statusSubtitle}
          />
          <View style={styles.arrivalPill}>
            <Image
              source={images.confirmedBookingTime}
              style={styles.arrivalIcon}
              resizeMode="contain"
            />
            <Text style={styles.arrivalText}>
              Estimated arrival:{" "}
              <Text style={styles.arrivalValue}>{arrival}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsHeaderLeft}>
              <Image
                source={images.service}
                style={styles.serviceIcon}
                resizeMode="contain"
              />
              <CustomText
                label="Service Details"
                fontFamily={fonts.semiBold}
                fontSize={16}
                color={TEXT}
              />
            </View>
            <View style={styles.bookingIdBadge}>
              <Text style={styles.bookingIdText}>{bookingLabel}</Text>
            </View>
          </View>

          <View style={styles.detailsDivider} />

          <View style={styles.infoBox}>
            <View style={styles.infoCol}>
              <CustomText
                label="SERVICE TYPE"
                fontFamily={fonts.bold}
                fontSize={11}
                color={MUTED}
                letterSpacing={0.4}
              />
              <CustomText
                label={plan.serviceType}
                fontFamily={fonts.semiBold}
                fontSize={14}
                color={TEXT}
                marginTop={6}
              />
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <CustomText
                label="ALLOCATION"
                fontFamily={fonts.bold}
                fontSize={11}
                color={MUTED}
                letterSpacing={0.4}
              />
              <View style={styles.allocationRow}>
                <Image
                  source={images.clearners}
                  style={styles.allocationIcon}
                  resizeMode="contain"
                />
                <CustomText
                  label={plan.allocation}
                  fontFamily={fonts.semiBold}
                  fontSize={14}
                  color={TEXT}
                />
              </View>
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.locationIconBox}>
              <Icons
                family="Ionicons"
                name="location-sharp"
                size={16}
                color={ACCENT}
              />
            </View>
            <View style={styles.addressCopy}>
              <CustomText
                label="SERVICE ADDRESS"
                fontFamily={fonts.bold}
                fontSize={11}
                color={MUTED}
                letterSpacing={0.4}
              />
              <CustomText
                label={address}
                fontFamily={fonts.medium}
                fontSize={14}
                color={TEXT}
                lineHeight={20}
                marginTop={4}
              />
            </View>
          </View>

          <View style={styles.verifiedBanner}>
            <Image
              source={images.verified}
              style={styles.verifiedIcon}
              resizeMode="contain"
            />
            <CustomText
              label="Vetted professionals & $1M damage protection included"
              fontFamily={fonts.medium}
              fontSize={13}
              color={TEXT}
              lineHeight={18}
              containerStyle={styles.verifiedText}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  statusCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },
  radar: {
    width: 140,
    height: 140,
  },
  statusTitle: {
    maxWidth: 280,
  },
  statusSubtitle: {
    maxWidth: 280,
  },
  arrivalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    gap: 6,
  },
  arrivalIcon: {
    width: 14,
    height: 14,
    tintColor: ACCENT,
  },
  arrivalText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.semiBold,
    color: ACCENT,
  },
  arrivalValue: {
    color: ACCENT,
    fontFamily: fonts.semiBold,
  },
  detailsCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceIcon: {
    width: 18,
    height: 18,
  },
  bookingIdBadge: {
    backgroundColor: "#F2F4F3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bookingIdText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: MUTED,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: "#ECEEEC",
    marginTop: 14,
    marginBottom: 14,
  },
  infoBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoDivider: {
    width: 1,
    backgroundColor: "#ECEEEC",
    marginHorizontal: 12,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  allocationIcon: {
    width: 14,
    height: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  addressCopy: {
    flex: 1,
  },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PURPLE_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 16,
    gap: 10,
  },
  verifiedIcon: {
    width: 18,
    height: 18,
  },
  verifiedText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  supportText: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.regular,
    color: MUTED,
  },
  supportLink: {
    color: ACCENT,
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
  },
});
