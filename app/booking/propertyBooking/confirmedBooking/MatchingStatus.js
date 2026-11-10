import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { images } from "../../../../assets/images/image";
import fonts from "../../../../components/assets/fonts";
import CustomText from "../../../../components/components/CustomText";
import Icons from "../../../../components/components/Icons";
import ImageFast from "../../../../components/components/ImageFast";
import ScreenWrapper from "../../../../components/components/ScreenWrapper";
import {
  BOOKING_TYPES,
  FLOW_ORDER,
  FLOW_STEPS,
  SERVICE_CONFIGS,
} from "./serviceConfigs";
import TrackingMap from "./TrackingMap";

const ACCENT = "#0E6E4C";
const TEXT = "#14332C";
const MUTED = "#888888";
const BADGE_BG = "#C5EFDE";

function Sparkle({ size = 8, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10" style={style}>
      <Path
        d="M5 0 L5.9 3.6 L10 4.5 L5.9 5.4 L5 10 L4.1 5.4 L0 4.5 L4.1 3.6 Z"
        fill={ACCENT}
      />
    </Svg>
  );
}

function ProgressRing({ icon, progress = 0.55, showSparkles = true }) {
  const size = 86;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringIconClip}>
        <ImageFast source={icon} style={styles.ringIcon} resizeMode="cover" />
      </View>

      <View style={styles.ringBg} pointerEvents="none" />

      <Svg
        width={size}
        height={size}
        style={styles.ringProgress}
        pointerEvents="none"
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D9E5E080"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0E6E4C"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {showSparkles ? (
        <>
          <Sparkle size={9} style={styles.sparkle1} />
          <Sparkle size={6} style={styles.sparkle2} />
          <Sparkle size={5} style={styles.sparkle3} />
        </>
      ) : null}
    </View>
  );
}

function ServiceDetails({ config, appointment, address, bottomPad }) {
  return (
    <View style={[styles.detailsCard, { paddingBottom: bottomPad }]}>
      <View style={styles.handle} />
      <View style={styles.servicePanel}>
        <View style={styles.detailsHeader}>
          <CustomText
            label={config.serviceTitle}
            fontSize={18}
            fontFamily={fonts.bold}
            color={TEXT}
            containerStyle={styles.serviceTitle}
          />
          <CustomText
            label={config.price}
            fontSize={18}
            fontFamily={fonts.bold}
            color={ACCENT}
          />
        </View>

        <View style={styles.detailsDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Image
              source={images.confirmedBookingTime}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <View style={styles.infoCopy}>
              <CustomText
                label="Appointment"
                fontSize={11}
                fontFamily={fonts.medium}
                color={MUTED}
                marginBottom={2}
              />
              <CustomText
                label={appointment}
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={TEXT}
                numberOfLines={1}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Image
              source={images.bookingAddress}
              style={styles.infoIcon}
              resizeMode="contain"
            />
            <View style={styles.infoCopy}>
              <CustomText
                label="Address"
                fontSize={11}
                fontFamily={fonts.medium}
                color={MUTED}
                marginBottom={2}
              />
              <CustomText
                label={address}
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={TEXT}
                numberOfLines={1}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function ProviderProfile({ config, bottomPad }) {
  const provider = config.provider;

  return (
    <View style={[styles.detailsCard, { paddingBottom: bottomPad }]}>
      <View style={styles.handle} />

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <ImageFast
            source={provider.avatar}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.verifiedBadge}>
            <Icons family="Ionicons" name="checkmark" size={10} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.profileCopy}>
          <View style={styles.nameRow}>
            <CustomText
              label={provider.name}
              fontSize={16}
              fontFamily={fonts.bold}
              color={TEXT}
            />
            <View style={styles.topProBadge}>
              <CustomText
                label={provider.badge}
                fontSize={11}
                fontFamily={fonts.semiBold}
                color={ACCENT}
              />
            </View>
          </View>
          <View style={styles.metaRow}>
            <Icons family="Ionicons" name="star" size={13} color="#F5B400" />
            <CustomText
              label={provider.rating}
              fontSize={13}
              fontFamily={fonts.semiBold}
              color={TEXT}
              marginLeft={4}
            />
            <CustomText
              label={` · ${provider.vehicle}`}
              fontSize={12}
              fontFamily={fonts.regular}
              color={MUTED}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn} activeOpacity={0.85}>
          <Icons family="Ionicons" name="call" size={18} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.chatCard} activeOpacity={0.85}>
        <View style={styles.chatIconWrap}>
          <Icons
            family="Ionicons"
            name="chatbubble-ellipses-outline"
            size={18}
            color={ACCENT}
          />
        </View>
        <CustomText
          label={config.chatLabel}
          fontSize={15}
          fontFamily={fonts.bold}
          color={TEXT}
          containerStyle={styles.chatLabel}
        />
        <Icons
          family="Ionicons"
          name="chevron-forward"
          size={18}
          color="#B0B8B4"
        />
      </TouchableOpacity>
    </View>
  );
}

export default function MatchingStatus({
  bookingType = BOOKING_TYPES.HOUSE_CLEANING,
  bookingId = "HC-8492",
  schedule,
  onBack,
  onHelp,
  serviceTitle,
  priceLabel,
}) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const flowStep = FLOW_ORDER[stepIndex] || FLOW_STEPS.MATCHING;
  const baseConfig =
    SERVICE_CONFIGS[bookingType] || SERVICE_CONFIGS.houseCleaning;
  const config = {
    ...baseConfig,
    serviceTitle: serviceTitle || baseConfig.serviceTitle,
    price: priceLabel || baseConfig.price,
  };
  const step = config.steps[flowStep];

  const appointment =
    schedule?.displayTime || schedule?.timeRange || "Today, 2:30 PM";
  const address = schedule?.address?.line || "Apt 402, Green Pa...";
  const bookingLabel = String(bookingId).startsWith("#")
    ? bookingId
    : `#${bookingId}`;
  const bottomPad = Math.max(insets.bottom, 16);

  const goPrev = () => {
    if (stepIndex === 0) {
      onBack?.();
      return;
    }
    setStepIndex((value) => Math.max(0, value - 1));
  };

  const goNext = () => {
    setStepIndex((value) => Math.min(FLOW_ORDER.length - 1, value + 1));
  };

  return (
    <ScreenWrapper
      backgroundColor="#F4F7F5"
      statusBarColor="#F4F7F5"
      paddingHorizontal={0}
      paddingBottom={0}
      scrollEnabled={false}
    >
      <View style={styles.root}>
        <TrackingMap
          style={styles.map}
          showLocate
          mode={flowStep}
          providerName={config.provider?.name?.split(" ")[0] || "Sarah"}
        />

        <View style={[styles.topBar, { top: Math.max(insets.top, 8) }]}>
          <TouchableOpacity style={styles.roundBtn} onPress={onBack}>
            <Icons
              family="Ionicons"
              name="chevron-back"
              size={20}
              color={TEXT}
            />
          </TouchableOpacity>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <CustomText
              label={`Booking Status ${bookingLabel}`}
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={ACCENT}
            />
          </View>

          <TouchableOpacity style={styles.helpBtn} onPress={onHelp}>
            <Icons
              family="Ionicons"
              name="help-circle-outline"
              size={16}
              color={TEXT}
            />
            <CustomText
              label="Help"
              fontSize={13}
              fontFamily={fonts.semiBold}
              color={TEXT}
            />
          </TouchableOpacity>
        </View>

        {/* Temporary flow controls */}
        <View style={[styles.flowControls, { top: Math.max(insets.top, 8) + 52 }]}>
          <TouchableOpacity style={styles.flowBtn} onPress={goPrev}>
            <CustomText
              label="Back"
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={ACCENT}
            />
          </TouchableOpacity>
          <CustomText
            label={`${stepIndex + 1}/${FLOW_ORDER.length}`}
            fontSize={11}
            fontFamily={fonts.medium}
            color={MUTED}
          />
          <TouchableOpacity
            style={[
              styles.flowBtn,
              stepIndex >= FLOW_ORDER.length - 1 && styles.flowBtnDisabled,
            ]}
            onPress={goNext}
            disabled={stepIndex >= FLOW_ORDER.length - 1}
          >
            <CustomText
              label="Next"
              fontSize={12}
              fontFamily={fonts.semiBold}
              color={stepIndex >= FLOW_ORDER.length - 1 ? MUTED : ACCENT}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomStack}>
          <View style={styles.matchingCard}>
            <View style={styles.matchingLeft}>
              {step.badge ? (
                <View style={styles.assignPill}>
                  <View style={styles.assignDot} />
                  <CustomText
                    label={step.badge}
                    fontSize={11}
                    fontFamily={fonts.semiBold}
                    color="#002114"
                  />
                </View>
              ) : null}

              {step.eta ? (
                <CustomText
                  label={step.eta}
                  fontSize={24}
                  lineHeight={28}
                  fontFamily={fonts.extraBold}
                  color={TEXT}
                  marginBottom={2}
                />
              ) : null}

              <CustomText
                label={step.title}
                fontSize={step.eta ? 16 : 22}
                lineHeight={step.eta ? 22 : 28}
                fontFamily={fonts.extraBold}
                color={ACCENT}
                marginBottom={6}
              />
              <CustomText
                label={step.subtitle}
                fontSize={14}
                lineHeight={20}
                fontFamily={
                  flowStep === FLOW_STEPS.MATCHING
                    ? fonts.semiBold
                    : fonts.regular
                }
                color={
                  flowStep === FLOW_STEPS.MATCHING ? ACCENT : MUTED
                }
                containerStyle={styles.statusSubtitle}
              />
              {step.note ? (
                <CustomText
                  label={step.note}
                  fontSize={13}
                  lineHeight={18}
                  fontFamily={fonts.regular}
                  color={MUTED}
                  marginTop={2}
                  containerStyle={styles.statusSubtitle}
                />
              ) : null}
            </View>
            <ProgressRing
              icon={config.serviceIcon}
              progress={step.progress}
              showSparkles={step.showSparkles}
            />
          </View>

          {step.bottom === "profile" ? (
            <ProviderProfile config={config} bottomPad={bottomPad} />
          ) : (
            <ServiceDetails
              config={config}
              appointment={appointment}
              address={address}
              bottomPad={bottomPad}
            />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 20,
  },
  flowControls: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 25,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  flowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E8F3EE",
  },
  flowBtnDisabled: {
    backgroundColor: "#EEF1EF",
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusPill: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  helpBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bottomStack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 12,
    zIndex: 20,
  },
  matchingCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    paddingVertical: 22,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  matchingLeft: {
    flex: 1,
    paddingRight: 14,
  },
  assignPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BADGE_BG,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  assignDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#0E6E4C",
  },
  statusSubtitle: {
    maxWidth: 190,
  },
  ringWrap: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
  },
  ringIconClip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: ACCENT,
    zIndex: 1,
  },
  ringIcon: {
    width: 48,
    height: 48,
  },
  ringBg: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D9E5E080",
    zIndex: 0,
  },
  ringProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
  sparkle1: {
    position: "absolute",
    top: 8,
    right: 12,
    zIndex: 3,
  },
  sparkle2: {
    position: "absolute",
    top: 2,
    right: 26,
    zIndex: 3,
  },
  sparkle3: {
    position: "absolute",
    top: 18,
    right: 2,
    zIndex: 3,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D7DDD9",
    alignSelf: "center",
    marginBottom: 14,
  },
  servicePanel: {
    backgroundColor: "#F4F7F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(190, 201, 193, 0.3)",
    padding: 14,
    gap: 15,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsDivider: {
    height: 1,
    backgroundColor: "rgba(190, 201, 193, 0.35)",
  },
  serviceTitle: {
    flex: 1,
    paddingRight: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(190, 201, 193, 0.45)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  infoIcon: {
    width: 16,
    height: 16,
    tintColor: ACCENT,
  },
  infoCopy: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(190, 201, 193, 0.35)",
    padding: 12,
    marginBottom: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F3EE",
  },
  verifiedBadge: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  topProBadge: {
    backgroundColor: BADGE_BG,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E8F3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(190, 201, 193, 0.45)",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  chatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F3EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatLabel: {
    flex: 1,
  },
});

