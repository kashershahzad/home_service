import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { images } from "../../../../assets/images/image";
import fonts from "../../../../components/assets/fonts";
import CustomText from "../../../../components/components/CustomText";
import Icons from "../../../../components/components/Icons";
import ImageFast from "../../../../components/components/ImageFast";
import ScreenWrapper from "../../../../components/components/ScreenWrapper";
import { bookingApi, getToken } from "../../../../utils/api";
import {
  BOOKING_TYPES,
  FLOW_STEPS,
  buildStepContent,
  getServiceConfig,
} from "./serviceConfigs";
import TrackingMap from "./TrackingMap";

const ACCENT = "#0E6E4C";
const TEXT = "#14332C";
const MUTED = "#888888";
const BADGE_BG = "#C5EFDE";
const POLL_MS = 5000;

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

function ProgressRing({
  icon,
  iconHasBg = false,
  progress = 0.55,
  showSparkles = true,
}) {
  const size = 86;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const offset = circumference * (1 - clamped);

  return (
    <View style={styles.ringWrap}>
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

      <View
        style={[
          styles.ringIconClip,
          !iconHasBg && styles.ringIconClipSolid,
        ]}
      >
        {icon ? (
          <Image
            source={icon}
            style={iconHasBg ? styles.ringIconFilled : styles.ringIconGlyph}
            resizeMode="contain"
          />
        ) : (
          <Icons family="Ionicons" name="person" size={22} color="#FFFFFF" />
        )}
      </View>

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

/** Same status rules as booking-view.js → matching flow step. */
function resolveFlowStep(rawStatus, hasAssignee) {
  const s = String(rawStatus || "")
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (
    s.includes("ontheway") ||
    s.includes("enroute") ||
    s.includes("dispatched") ||
    s === "started" ||
    s === "inprogress"
  ) {
    return FLOW_STEPS.ON_THE_WAY;
  }
  if (s === "assigned" || s.includes("assigned") || hasAssignee) {
    return FLOW_STEPS.ASSIGNED;
  }
  return FLOW_STEPS.MATCHING;
}

function pickAssignees(booking = {}) {
  if (Array.isArray(booking.assignees)) return booking.assignees;
  if (Array.isArray(booking.assignedProfessionals))
    return booking.assignedProfessionals;
  if (Array.isArray(booking.professionals)) return booking.professionals;
  return [];
}

function ServiceDetails({
  serviceTitle,
  price,
  appointment,
  address,
  bottomPad,
}) {
  return (
    <View style={[styles.detailsCard, { paddingBottom: bottomPad }]}>
      <View style={styles.handle} />
      <View style={styles.servicePanel}>
        <View style={styles.detailsHeader}>
          <CustomText
            label={serviceTitle || "Service"}
            fontSize={18}
            fontFamily={fonts.bold}
            color={TEXT}
            containerStyle={styles.serviceTitle}
          />
          {price ? (
            <CustomText
              label={price}
              fontSize={18}
              fontFamily={fonts.bold}
              color={ACCENT}
            />
          ) : null}
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
                label={appointment || "—"}
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
                label={address || "—"}
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

function ProviderProfile({ provider, chatLabel, bottomPad, bookingId, onChat }) {
  if (!provider?.name) {
    return (
      <View style={[styles.detailsCard, { paddingBottom: bottomPad }]}>
        <View style={styles.handle} />
        <CustomText
          label="Professional details will appear once assigned."
          fontSize={14}
          fontFamily={fonts.medium}
          color={MUTED}
          textAlign="center"
          marginBottom={8}
        />
      </View>
    );
  }

  const avatarSource = provider.avatar
    ? typeof provider.avatar === "string"
      ? { uri: provider.avatar }
      : provider.avatar
    : null;

  return (
    <View style={[styles.detailsCard, { paddingBottom: bottomPad }]}>
      <View style={styles.handle} />

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {avatarSource ? (
            <ImageFast
              source={avatarSource}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icons family="Ionicons" name="person" size={22} color={MUTED} />
            </View>
          )}
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
            {provider.badge ? (
              <View style={styles.topProBadge}>
                <CustomText
                  label={provider.badge}
                  fontSize={11}
                  fontFamily={fonts.semiBold}
                  color={ACCENT}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            {provider.rating ? (
              <>
                <Icons family="Ionicons" name="star" size={13} color="#F5B400" />
                <CustomText
                  label={provider.rating}
                  fontSize={13}
                  fontFamily={fonts.semiBold}
                  color={TEXT}
                  marginLeft={4}
                />
              </>
            ) : null}
            {provider.vehicle ? (
              <CustomText
                label={`${provider.rating ? " · " : ""}${provider.vehicle}`}
                fontSize={12}
                fontFamily={fonts.regular}
                color={MUTED}
              />
            ) : null}
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn} activeOpacity={0.85}>
          <Icons family="Ionicons" name="call" size={18} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.chatCard}
        activeOpacity={0.85}
        onPress={() =>
          onChat?.({
            name: provider.name,
            bookingId,
            chatLabel,
          })
        }
      >
        <View style={styles.chatIconWrap}>
          <Icons
            family="Ionicons"
            name="chatbubble-ellipses-outline"
            size={18}
            color={ACCENT}
          />
        </View>
        <CustomText
          label={chatLabel || "Chat"}
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

function formatMoney(total) {
  if (total == null || total === "") return null;
  const n = Number(total);
  if (!Number.isFinite(n)) return String(total);
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export default function MatchingStatus({
  bookingType = BOOKING_TYPES.HOUSE_CLEANING,
  bookingId,
  bookingApiId,
  schedule,
  onBack,
  onHelp,
  serviceTitle,
  priceLabel,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pollId = String(bookingApiId || bookingId || "").replace(/^#/, "");
  const [flowStep, setFlowStep] = useState(FLOW_STEPS.MATCHING);
  const [liveBooking, setLiveBooking] = useState(null);

  const serviceConfig = getServiceConfig(bookingType);

  const refreshBooking = useCallback(async () => {
    if (!pollId) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await bookingApi.getById(token, pollId);
      const booking = res?.booking || res?.data || res;
      if (!booking || typeof booking !== "object") return;

      setLiveBooking(booking);
      const assignees = pickAssignees(booking);
      const hasAssignee = assignees.length > 0;
      setFlowStep(
        resolveFlowStep(booking.screen || booking.status, hasAssignee),
      );
    } catch (err) {
      console.log("[MatchingStatus] poll failed:", err?.message || err);
    }
  }, [pollId]);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const tick = async () => {
      if (!mounted) return;
      await refreshBooking();
      if (!mounted) return;
      timer = setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [refreshBooking]);

  const liveProvider = useMemo(() => {
    const assignees = pickAssignees(liveBooking || {});
    const pro = assignees[0];
    if (!pro) return null;
    return {
      name: pro.fullName || pro.name || null,
      badge: pro.badge || null,
      rating: pro.rating != null ? String(pro.rating) : null,
      vehicle: pro.vehicle || pro.transport || null,
      avatar: pro.avatar || pro.photo || pro.image || null,
    };
  }, [liveBooking]);

  const displayTitle = useMemo(() => {
    return (
      liveBooking?.packageSnapshot?.name ||
      liveBooking?.allocation?.planName ||
      liveBooking?.category?.name ||
      serviceTitle ||
      null
    );
  }, [liveBooking, serviceTitle]);

  const displayPrice = useMemo(() => {
    const fromApi = formatMoney(liveBooking?.pricing?.total);
    return fromApi || priceLabel || null;
  }, [liveBooking, priceLabel]);

  const appointment = useMemo(() => {
    const sched = liveBooking?.schedule || {};
    return (
      sched.startTime ||
      sched.slotLabel ||
      sched.slot ||
      schedule?.displayTime ||
      schedule?.timeRange ||
      liveBooking?.estimatedArrival ||
      null
    );
  }, [liveBooking, schedule]);

  const address = useMemo(() => {
    const addr = liveBooking?.address || {};
    return (
      addr.line ||
      addr.addressLine ||
      [addr.label, addr.area, addr.city].filter(Boolean).join(", ") ||
      schedule?.address?.line ||
      null
    );
  }, [liveBooking, schedule]);

  const liveTracking = useMemo(
    () => liveBooking?.tracking || liveBooking?.statusCard?.tracking || null,
    [liveBooking],
  );

  const homeCoords = useMemo(() => {
    const addr = liveBooking?.address || schedule?.address || {};
    const lat =
      addr.lat ??
      addr.latitude ??
      addr.location?.lat ??
      (Array.isArray(addr.location?.coordinates)
        ? addr.location.coordinates[1]
        : null);
    const lng =
      addr.lng ??
      addr.longitude ??
      addr.location?.lng ??
      (Array.isArray(addr.location?.coordinates)
        ? addr.location.coordinates[0]
        : null);
    if (lat == null || lng == null) return null;
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
    return { latitude: la, longitude: ln };
  }, [liveBooking, schedule]);

  const providerCoords = useMemo(() => {
    const lat = liveTracking?.lat ?? liveTracking?.latitude;
    const lng = liveTracking?.lng ?? liveTracking?.longitude;
    if (lat == null || lng == null) return null;
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
    return { latitude: la, longitude: ln };
  }, [liveTracking]);

  const hasProviderLocation = providerCoords != null;

  const step = useMemo(
    () =>
      buildStepContent({
        flowStep,
        role: serviceConfig.role,
        providerName: liveProvider?.name,
        statusMessage:
          liveBooking?.statusMessage ||
          liveBooking?.message ||
          null,
        headline:
          liveBooking?.headline ||
          liveBooking?.statusCard?.headline ||
          liveBooking?.trackingHeadline ||
          null,
        tracking: liveTracking,
      }),
    [flowStep, liveBooking, liveProvider?.name, liveTracking, serviceConfig.role],
  );

  const displayRef = liveBooking?.reference || bookingId || pollId || null;
  const bookingLabel = displayRef
    ? String(displayRef).startsWith("#")
      ? String(displayRef)
      : `#${displayRef}`
    : "Booking";
  const bottomPad = Math.max(insets.bottom, 16);

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
          home={homeCoords || undefined}
          provider={providerCoords || undefined}
          hasProviderLocation={hasProviderLocation}
          providerLabel={liveProvider?.name?.split(" ")[0] || undefined}
          minutesAway={
            liveTracking?.minutesAway != null
              ? Number(liveTracking.minutesAway)
              : null
          }
          showLocationNotFound={
            (flowStep === FLOW_STEPS.ASSIGNED ||
              flowStep === FLOW_STEPS.ON_THE_WAY) &&
            !hasProviderLocation
          }
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
              {step.subtitle ? (
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
              ) : null}
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
              icon={serviceConfig.serviceIcon}
              iconHasBg={!!serviceConfig.iconHasBg}
              progress={step.progress}
              showSparkles={step.showSparkles}
            />
          </View>

          {step.bottom === "profile" ? (
            <ProviderProfile
              provider={liveProvider}
              chatLabel={serviceConfig.chatLabel}
              bottomPad={bottomPad}
              bookingId={bookingLabel}
              onChat={({ name }) =>
                router.push({
                  pathname: "/chat",
                  params: {
                    name: name || "",
                    bookingId: pollId || "",
                  },
                })
              }
            />
          ) : (
            <ServiceDetails
              serviceTitle={displayTitle}
              price={displayPrice}
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
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    backgroundColor: "transparent",
  },
  ringIconClipSolid: {
    backgroundColor: ACCENT,
  },
  ringIconFilled: {
    width: 54,
    height: 54,
  },
  ringIconGlyph: {
    width: 26,
    height: 26,
    tintColor: "#FFFFFF",
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
    zIndex: 4,
  },
  sparkle2: {
    position: "absolute",
    top: 2,
    right: 26,
    zIndex: 4,
  },
  sparkle3: {
    position: "absolute",
    top: 18,
    right: 2,
    zIndex: 4,
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
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
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

