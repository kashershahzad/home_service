import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { images } from "../assets/images/image";
import fonts from "../components/assets/fonts";
import CustomText from "../components/components/CustomText";
import Icons from "../components/components/Icons";
import { authApi, bookingApi, getToken } from "../utils/api";
import { toPersistableProfileImage } from "../utils/profileImage";

const COLORS = {
  primary: "#0E6E4C",
  primarySoft: "#E8F5EF",
  bg: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F1F2E",
  muted: "#8A948F",
  label: "#9AA39E",
  border: "#E7ECE9",
  // Content cards only. Status heroes use no stroke.
  cardStroke: "#E2E8F0",
  nested: "#EEF3F7",
  star: "#F5B400",
  cancelBg: "#FFF1F1",
  cancelText: "#E11D48",
  cancelDivider: "#F3D4D6",
  cardBorder: "#E6EBE8",
  free: "#16A34A",
  callBg: "#EEF2F0",
};

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

const DEFAULT_REVIEW_TAGS = [
  "Professional",
  "On time",
  "Friendly",
  "Good quality",
  "Attention to detail",
  "Would hire again",
];
const CLEANING_TAGS = [
  "Spotless clean",
  "Punctual",
  "Professional",
  "Eco-friendly products",
  ...DEFAULT_REVIEW_TAGS.filter(
    (t) => !["Professional", "On time"].includes(t),
  ),
];
const STYLIST_TAGS = [
  "Great cut",
  "Punctual",
  "Professional",
  "Friendly",
  ...DEFAULT_REVIEW_TAGS.filter(
    (t) => !["Professional", "Friendly", "On time"].includes(t),
  ),
];

/** Same as edit-profile / signup: persist image via PUT /auth/profile, return URL. */
async function resolvePhotoUrlViaProfileApi(token, localUri) {
  if (!localUri) return null;
  if (/^(https?:\/\/|data:image\/)/i.test(localUri)) return localUri;

  let previousUrl = null;
  try {
    const me = await authApi.getMe(token);
    previousUrl = me?.user?.profileImageUrl ?? me?.profileImageUrl ?? null;
  } catch {
    // ignore — still try upload
  }

  const persistable = await toPersistableProfileImage(localUri);
  const saved = await authApi.completeProfile(token, {
    profileImageUrl: persistable,
  });
  const uploadedUrl = saved?.user?.profileImageUrl || persistable;

  // Restore avatar so review photo doesn't replace profile pic permanently
  if (previousUrl && previousUrl !== uploadedUrl) {
    try {
      await authApi.completeProfile(token, {
        profileImageUrl: previousUrl,
      });
    } catch {
      // non-fatal
    }
  }

  return uploadedUrl;
}

function ReviewCard({
  providerName,
  roleLabel,
  tags,
  existingReview,
  submitting,
  onSubmit,
  onBookAgain,
}) {
  const [rating, setRating] = useState(
    existingReview?.score ? Number(existingReview.score) : 5,
  );
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(existingReview?.tags) ? existingReview.tags : [],
  );
  const [note, setNote] = useState(existingReview?.text || "");
  const [tipAmount, setTipAmount] = useState(
    existingReview?.tipAmount != null
      ? String(existingReview.tipAmount)
      : "",
  );
  const [photoUri, setPhotoUri] = useState(
    existingReview?.photoUrl || null,
  );
  const [photoAspect, setPhotoAspect] = useState(4 / 3);

  const setPickedPhoto = (asset) => {
    if (!asset?.uri) return;
    setPhotoUri(asset.uri);
    const w = Number(asset.width) || 0;
    const h = Number(asset.height) || 0;
    if (w > 0 && h > 0) {
      // Clamp so preview stays usable (not tiny strip / not full-screen tall)
      setPhotoAspect(Math.min(Math.max(w / h, 0.65), 1.8));
    } else {
      setPhotoAspect(4 / 3);
    }
  };
  const submitted = !!existingReview?.score;
  const firstName = providerName
    ? String(providerName).split(" ")[0]
    : roleLabel || "your pro";
  const experienceLabel =
    String(roleLabel || "").toLowerCase().includes("stylist") ||
    String(roleLabel || "").toLowerCase().includes("hair")
      ? "styling"
      : "cleaning";

  const toggleTag = (tag) => {
    if (submitted) return;
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const pickReviewPhoto = () => {
    if (submitted) return;
    Alert.alert("Add photo", "Choose a photo for your review", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission Needed",
              "Please enable camera access in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() },
              ],
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setPickedPhoto(result.assets[0]);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(
              "Permission Needed",
              "Please enable photo access in Settings.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() },
              ],
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setPickedPhoto(result.assets[0]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.reviewCard}>
      <CustomText
        label={`How was your ${experienceLabel} experience?`}
        removeTranslation
        fontSize={18}
        fontFamily={fonts.bold}
        color={COLORS.text}
      />
      <CustomText
        label={`Your feedback helps ${firstName} and ensures our high standards.`}
        removeTranslation
        fontSize={13}
        fontFamily={fonts.medium}
        color={COLORS.muted}
        marginTop={6}
        lineHeight={19}
      />

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            hitSlop={HIT_SLOP}
            disabled={submitted}
            onPress={() => setRating(star)}
            activeOpacity={0.8}
          >
            <Icons
              family="Ionicons"
              name={star <= rating ? "star" : "star-outline"}
              size={34}
              color={COLORS.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      <CustomText
        label="WHAT WENT GREAT?"
        removeTranslation
        fontSize={11}
        fontFamily={fonts.semiBold}
        color={COLORS.label}
        letterSpacing={0.7}
        marginTop={18}
        marginBottom={10}
      />
      <View style={styles.tagsWrap}>
        {tags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, active && styles.tagChipActive]}
              onPress={() => toggleTag(tag)}
              disabled={submitted}
              activeOpacity={0.85}
            >
              <CustomText
                label={tag}
                removeTranslation
                fontSize={13}
                fontFamily={fonts.semiBold}
                color={active ? COLORS.primary : COLORS.text}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomText
        label="PHOTO (OPTIONAL)"
        removeTranslation
        fontSize={11}
        fontFamily={fonts.semiBold}
        color={COLORS.label}
        letterSpacing={0.7}
        marginTop={14}
        marginBottom={8}
      />
      {photoUri ? (
        <View style={styles.reviewPhotoWrap}>
          <Image
            source={{ uri: photoUri }}
            style={[styles.reviewPhoto, { aspectRatio: photoAspect }]}
            resizeMode="contain"
          />
          {!submitted ? (
            <View style={styles.reviewPhotoActions}>
              <TouchableOpacity
                style={styles.reviewPhotoBtn}
                onPress={pickReviewPhoto}
                activeOpacity={0.85}
              >
                <CustomText
                  label="Change"
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.semiBold}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reviewPhotoBtn}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoAspect(4 / 3);
                }}
                activeOpacity={0.85}
              >
                <CustomText
                  label="Remove"
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.semiBold}
                  color={COLORS.cancelText}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : !submitted ? (
        <TouchableOpacity
          style={styles.addPhotoBtn}
          onPress={pickReviewPhoto}
          activeOpacity={0.85}
        >
          <Icons
            family="Ionicons"
            name="camera-outline"
            size={20}
            color={COLORS.primary}
          />
          <CustomText
            label="Add photo"
            removeTranslation
            fontSize={14}
            fontFamily={fonts.semiBold}
            color={COLORS.primary}
            marginLeft={8}
          />
        </TouchableOpacity>
      ) : null}

      <TextInput
        style={styles.reviewInput}
        value={note}
        onChangeText={setNote}
        editable={!submitted}
        multiline
        placeholder={`Add an optional note or feedback for ${firstName}...`}
        placeholderTextColor="#9AA39E"
        textAlignVertical="top"
      />

      <CustomText
        label="TIP (OPTIONAL)"
        removeTranslation
        fontSize={11}
        fontFamily={fonts.semiBold}
        color={COLORS.label}
        letterSpacing={0.7}
        marginTop={14}
        marginBottom={8}
      />
      <TextInput
        style={styles.tipInput}
        value={tipAmount}
        onChangeText={(v) => setTipAmount(v.replace(/[^0-9.]/g, ""))}
        editable={!submitted}
        keyboardType="numeric"
        placeholder="e.g. 500"
        placeholderTextColor="#9AA39E"
      />

      {!submitted ? (
        <TouchableOpacity
          style={styles.submitReviewBtn}
          activeOpacity={0.88}
          disabled={submitting || rating < 1}
          onPress={() => {
            const tip = tipAmount.trim() === "" ? null : Number(tipAmount);
            onSubmit?.({
              rating,
              tags: selectedTags,
              comment: note.trim(),
              tipAmount:
                tip != null && Number.isFinite(tip) && tip >= 0 ? tip : null,
              photoUri: photoUri || null,
            });
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icons
                family="Ionicons"
                name="send"
                size={16}
                color="#FFFFFF"
              />
              <CustomText
                label="Submit Review"
                removeTranslation
                fontSize={16}
                fontFamily={fonts.bold}
                color="#FFFFFF"
                marginLeft={8}
              />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.reviewSubmitted}>
          <Icons
            family="Ionicons"
            name="checkmark-circle"
            size={18}
            color={COLORS.primary}
          />
          <CustomText
            label="Thanks for your feedback!"
            removeTranslation
            fontSize={14}
            fontFamily={fonts.semiBold}
            color={COLORS.primary}
            marginLeft={8}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.bookAgainSoftBtn}
        activeOpacity={0.88}
        onPress={onBookAgain}
      >
        <Icons
          family="Ionicons"
          name="calendar-outline"
          size={18}
          color={COLORS.primary}
        />
        <CustomText
          label="Book Again"
          removeTranslation
          fontSize={16}
          fontFamily={fonts.bold}
          color={COLORS.primary}
          marginLeft={8}
        />
      </TouchableOpacity>
    </View>
  );
}

function normalizeStatus(raw) {
  const s = String(raw || "Booked").toLowerCase().replace(/[_\s-]+/g, "");
  if (s.includes("cancel")) return "Cancelled";
  if (s.includes("complete") || s === "done") return "Completed";
  if (
    s.includes("ontheway") ||
    s.includes("enroute") ||
    s.includes("dispatched") ||
    s === "started" ||
    s === "inprogress"
  ) {
    return "OnTheWay";
  }
  if (s.includes("unassign")) return "Confirmed";
  if (s === "assigned" || s.includes("assigned")) return "Assigned";
  if (s === "confirmed" || s.includes("confirmed")) return "Confirmed";
  return "Booked";
}

/** Circular progress for booking flow stages. */
function getStatusProgress(status) {
  switch (status) {
    case "Confirmed":
      return 0.25;
    case "Assigned":
      return 0.5;
    case "OnTheWay":
    case "Booked":
      return 0.75;
    case "Completed":
      return 1;
    default:
      return 0.25;
  }
}

function StatusProgressRing({ progress = 0.25, children, size = 78 }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const offset = circumference * (1 - clamped);

  return (
    <View style={[styles.etaRingWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.etaRingSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D7E5DE"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.etaRingCenter}>{children}</View>
    </View>
  );
}

function getServiceRole(categorySlug, categoryName, title) {
  const key =
    `${categorySlug || ""} ${categoryName || ""} ${title || ""}`.toLowerCase();
  if (
    key.includes("hair") ||
    key.includes("groom") ||
    key.includes("salon") ||
    key.includes("dress") ||
    key.includes("beauty")
  ) {
    return {
      role: "Stylist",
      onTheWay: "Stylist On The Way",
      assigned: "Stylist Assigned",
      bookingConfirmed: "Matching",
      chat: "Chat with your stylist",
      completedBy: "Styled & inspected by",
      iconFamily: "MaterialCommunityIcons",
      iconName: "content-cut",
      iconImage: images.scissors,
      iconHasBg: false,
    };
  }
  if (
    key.includes("clean") ||
    key.includes("maid") ||
    key.includes("home") ||
    key.includes("bhk") ||
    key.includes("flat")
  ) {
    return {
      role: "Cleaner",
      onTheWay: "Cleaner On The Way",
      assigned: "Cleaner Assigned",
      bookingConfirmed: "Matching",
      chat: "Chat with your cleaner",
      completedBy: "Cleaned & inspected by",
      iconFamily: "MaterialCommunityIcons",
      iconName: "broom",
      // brushicon.png already has green circle + white brush — do not tint
      iconImage: images.brushIcon,
      iconHasBg: true,
    };
  }
  return {
    role: "Professional",
    onTheWay: "Professional On The Way",
    assigned: "Professional Assigned",
    bookingConfirmed: "Matching",
    chat: "Chat with your pro",
    completedBy: "Completed & inspected by",
    iconFamily: "Ionicons",
    iconName: "person",
    iconImage: images.brushIcon,
    iconHasBg: true,
  };
}

function buildEtaRange(tracking) {
  if (!tracking) return null;
  const lowRaw =
    tracking.etaMinutesMin ??
    tracking.minutesMin ??
    tracking.minutesAwayLow ??
    tracking.minutesAway;
  const highRaw =
    tracking.etaMinutesMax ??
    tracking.minutesMax ??
    tracking.minutesAwayHigh ??
    (tracking.minutesAway != null && tracking.minutesAway !== ""
      ? Number(tracking.minutesAway) + 10
      : null);
  if (lowRaw == null || lowRaw === "") return null;
  const low = Number(lowRaw);
  const high =
    highRaw != null && highRaw !== "" ? Number(highRaw) : null;
  if (Number.isNaN(low)) return null;
  if (high != null && !Number.isNaN(high) && high !== low) {
    return { low: String(Math.round(low)), high: String(Math.round(high)) };
  }
  return { low: String(Math.round(low)), high: null };
}

function buildEstArrival(headline, tracking, fallbackStartTime) {
  const start = tracking?.estimatedArrivalStart;
  const end = tracking?.estimatedArrivalEnd;
  if (start || end) {
    return `Est. Arrival ${[start, end].filter(Boolean).join(" – ")}`;
  }
  if (headline) {
    const cleaned = String(headline)
      .replace(/^expected\s+arrival\s*/i, "")
      .replace(/^est\.?\s*arrival\s*/i, "")
      .trim();
    if (cleaned) return `Est. Arrival ${cleaned}`;
  }
  if (fallbackStartTime) return `Est. Arrival ${fallbackStartTime}`;
  return null;
}

function resolveFlowStatus(status, hasAssignee) {
  if (status === "Completed" || status === "Cancelled") return status;
  if (status === "OnTheWay") return "OnTheWay";
  if (status === "Assigned") return "Assigned";
  if (status === "Confirmed") return hasAssignee ? "Assigned" : "Confirmed";
  // Legacy "Booked"
  if (hasAssignee) return "OnTheWay";
  return "Confirmed";
}

function StatusHero({
  status,
  hasAssignee = false,
  providerName,
  dateLabel,
  startTime,
  headline,
  tracking,
  statusMessage,
  refundLabel,
  refundNote,
  serviceRole,
}) {
  const role = serviceRole || getServiceRole();
  const flowStatus = resolveFlowStatus(status, hasAssignee);
  const progress = getStatusProgress(flowStatus);

  if (status === "Completed") {
    const when = [dateLabel, startTime ? `at ${startTime}` : null]
      .filter(Boolean)
      .join(" ");
    return (
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <StatusProgressRing progress={1} size={72}>
            <Image source={images.successful} style={styles.successImageInner} />
          </StatusProgressRing>
          <View style={[styles.heroCopy, styles.heroCopyCompleted]}>
            <View style={styles.verifiedRow}>
              <Icons
                family="Ionicons"
                name="shield-checkmark-outline"
                size={14}
                color={COLORS.primary}
              />
              <CustomText
                label="Completed & Verified"
                removeTranslation
                fontSize={13}
                fontFamily={fonts.bold}
                color={COLORS.primary}
                marginLeft={5}
              />
            </View>
            <CustomText
              label="Service Completed Successfully"
              removeTranslation
              fontSize={20}
              fontFamily={fonts.bold}
              color={COLORS.text}
              lineHeight={26}
              marginTop={6}
            />
          </View>
        </View>
        {when ? (
          <CustomText
            label={when}
            removeTranslation
            fontSize={13}
            fontFamily={fonts.medium}
            color={COLORS.muted}
            marginTop={14}
          />
        ) : null}
        {providerName ? (
          <View style={styles.verifyBox}>
            <View style={styles.verifyDot}>
              <Icons
                family="Ionicons"
                name="checkmark"
                size={12}
                color="#FFFFFF"
              />
            </View>
            <CustomText
              label={`${role.completedBy} ${providerName}`}
              removeTranslation
              fontSize={13}
              fontFamily={fonts.semiBold}
              color={COLORS.text}
              marginLeft={10}
              containerStyle={{ flex: 1 }}
            />
          </View>
        ) : null}
      </View>
    );
  }

  if (status === "Cancelled") {
    const cancelledOn = [dateLabel, startTime].filter(Boolean).join(", ");
    return (
      <View style={[styles.heroCard, styles.heroCancel]}>
        <View style={styles.heroTop}>
          <View style={styles.cancelBadgeOuter}>
            <View style={styles.cancelBadge}>
              <Icons family="Ionicons" name="close" size={22} color="#FFFFFF" />
            </View>
          </View>
          <View style={[styles.heroCopy, styles.heroCopyCompleted]}>
            <CustomText
              label="Booking Cancelled"
              removeTranslation
              fontSize={18}
              fontFamily={fonts.bold}
              color={COLORS.text}
            />
            {cancelledOn ? (
              <CustomText
                label={`Cancelled on ${cancelledOn}`}
                removeTranslation
                fontSize={13}
                fontFamily={fonts.medium}
                color={COLORS.muted}
                marginTop={4}
              />
            ) : null}
          </View>
        </View>
        {refundLabel || refundNote ? (
          <>
            <View style={styles.cancelDivider} />
            <View style={styles.refundRow}>
              <View style={styles.refundSeal}>
                <Icons
                  family="Ionicons"
                  name="checkmark"
                  size={11}
                  color="#FFFFFF"
                />
              </View>
              {refundLabel ? (
                <CustomText
                  label={refundLabel}
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.bold}
                  color={COLORS.cancelText}
                  marginLeft={8}
                />
              ) : null}
              {refundNote ? (
                <CustomText
                  label={refundNote}
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.medium}
                  color={COLORS.muted}
                  marginLeft={6}
                  containerStyle={{ flexShrink: 1 }}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    );
  }

  // Confirmed → Assigned → On the way — ETA + title + message + arrival
  const isConfirmed = flowStatus === "Confirmed";
  const isAssigned = flowStatus === "Assigned";
  const etaRange =
    isConfirmed || isAssigned ? null : buildEtaRange(tracking);
  const arrivalLabel =
    isConfirmed || isAssigned
      ? null
      : buildEstArrival(headline, tracking, startTime);
  const statusTitle = isConfirmed
    ? role.bookingConfirmed || "Matching"
    : isAssigned
      ? role.assigned || `${role.role} Assigned`
      : role.onTheWay;
  const confirmedDescription =
    "We'll contact you soon once a professional is matched for your booking.";
  const assignedDescription = `Your ${String(role.role || "professional").toLowerCase()} has been assigned and will be on the way soon.`;
  const messageBelowTitle = isConfirmed
    ? statusMessage || confirmedDescription
    : isAssigned
      ? statusMessage || assignedDescription
      : statusMessage;

  return (
    <View style={[styles.heroCard, styles.heroOnWay]}>
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          {etaRange ? (
            <View style={styles.etaRangeRow}>
              <CustomText
                label={
                  etaRange.high
                    ? `${etaRange.low} — ${etaRange.high}`
                    : etaRange.low
                }
                removeTranslation
                fontSize={34}
                fontFamily={fonts.extraBold}
                color={COLORS.text}
                lineHeight={40}
              />
              <CustomText
                label="mins"
                removeTranslation
                fontSize={15}
                fontFamily={fonts.semiBold}
                color={COLORS.muted}
                marginLeft={8}
                marginBottom={4}
              />
            </View>
          ) : null}
          <CustomText
            label={statusTitle}
            removeTranslation
            fontSize={isConfirmed ? 22 : 16}
            fontFamily={fonts.bold}
            color={COLORS.primary}
            marginTop={etaRange ? 2 : 0}
          />
          {messageBelowTitle ? (
            <CustomText
              label={messageBelowTitle}
              removeTranslation
              fontSize={13}
              fontFamily={fonts.medium}
              color={COLORS.muted}
              marginTop={8}
              lineHeight={19}
              containerStyle={{ paddingRight: 4 }}
            />
          ) : null}
        </View>
        <StatusProgressRing progress={progress}>
          {role.iconHasBg && role.iconImage ? (
            <Image
              source={role.iconImage}
              style={styles.etaServiceIconFilled}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.etaInnerSolid}>
              {role.iconImage ? (
                <Image
                  source={role.iconImage}
                  style={styles.etaServiceIconLight}
                  resizeMode="contain"
                />
              ) : (
                <Icons
                  family={role.iconFamily}
                  name={role.iconName}
                  size={24}
                  color="#FFFFFF"
                />
              )}
            </View>
          )}
        </StatusProgressRing>
      </View>
      {arrivalLabel ? (
        <>
          <View style={styles.onWayDivider} />
          <CustomText
            label={arrivalLabel}
            removeTranslation
            fontSize={13}
            fontFamily={fonts.bold}
            color="#6B7280"
          />
        </>
      ) : null}
    </View>
  );
}

function formatDateLabel(dateRaw) {
  if (!dateRaw) return "";
  const dateISO = String(dateRaw).slice(0, 10);
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapBookingDetail(raw = {}) {
  const booking = raw?.booking || raw?.data || raw;
  const assignees = Array.isArray(booking.assignees)
    ? booking.assignees
    : Array.isArray(booking.assignedProfessionals)
      ? booking.assignedProfessionals
      : Array.isArray(booking.professionals)
        ? booking.professionals
        : [];
  const pro = assignees[0] || null;
  const schedule = booking.schedule || {};
  const address = booking.address || {};
  const pricing = booking.pricing || {};
  const allocation = booking.allocation || {};

  const categorySlug = booking.categorySlug || booking.category?.slug || null;
  const categoryName = booking.category?.name || booking.categoryName || null;
  const title =
    booking.packageSnapshot?.name ||
    allocation.planName ||
    categoryName ||
    categorySlug ||
    null;
  const serviceRole = getServiceRole(categorySlug, categoryName, title);

  const dateLabel = formatDateLabel(schedule.date || booking.date);
  const startTime =
    schedule.startTime ||
    schedule.slotLabel ||
    schedule.slot ||
    booking.estimatedArrival ||
    null;
  const endTime = schedule.endTime || null;
  const durationMins =
    schedule.durationMins ||
    booking.durationMins ||
    booking.packageSnapshot?.durationMins ||
    (allocation.durationHours != null
      ? Math.round(Number(allocation.durationHours) * 60)
      : null);
  const durationLabel = durationMins ? `${durationMins} mins` : null;
  const appointmentTime = [startTime, endTime].filter(Boolean).join(" – ");
  const appointmentTimeWithDuration = [appointmentTime, durationLabel]
    .filter(Boolean)
    .join(" • ");

  const addressLine =
    address.line ||
    address.addressLine ||
    [address.label, address.area, address.city].filter(Boolean).join(", ") ||
    null;
  const addressNotes =
    address.notes ||
    address.accessNotes ||
    address.instructions ||
    booking.accessNotes ||
    null;

  const lineItems = Array.isArray(pricing.lineItems)
    ? pricing.lineItems
    : Array.isArray(pricing.breakdown)
      ? pricing.breakdown
      : [];

  return {
    id: String(booking.id || booking._id || ""),
    reference: booking.reference
      ? String(booking.reference).replace(/^#/, "")
      : null,
    status: normalizeStatus(booking.screen || booking.status),
    categorySlug,
    categoryName,
    serviceRole,
    title,
    providerName: pro ? pro.fullName || pro.name || null : null,
    providerImage: pro ? pro.avatar || pro.photo || pro.image || null : null,
    providerRating: pro?.rating != null ? String(pro.rating) : null,
    providerBadge: pro?.badge || booking.providerBadge || null,
    providerVehicle:
      pro?.vehicle ||
      pro?.transport ||
      booking.providerVehicle ||
      null,
    providerPhone: pro?.phone || pro?.mobile || null,
    hasAssignee: assignees.length > 0,
    dateLabel,
    startTime,
    appointmentTimeWithDuration,
    addressLine,
    addressNotes,
    addressVerified: address.verified === true || booking.homeAccessVerified === true,
    headline:
      booking.headline ||
      booking.statusCard?.headline ||
      booking.trackingHeadline ||
      null,
    tracking: booking.tracking || booking.statusCard?.tracking || null,
    statusMessage: booking.statusMessage || booking.message || null,
    refundLabel: booking.refundLabel || booking.refund?.label || null,
    refundNote: booking.refundNote || booking.refund?.note || null,
    pricing: {
      serviceAmount: pricing.serviceAmount ?? pricing.subtotal ?? null,
      addOnsAmount: pricing.addOnsAmount ?? null,
      serviceFee: pricing.serviceFeeAndTaxes ?? pricing.serviceFee ?? null,
      taxes: pricing.taxes ?? null,
      travelFee: pricing.travelFee ?? null,
      kitFee: pricing.kitFee ?? pricing.safetyKitFee ?? null,
      total: pricing.total ?? booking.total ?? booking.amount ?? null,
      currency: pricing.currency || "PKR",
      lineItems,
    },
    paymentStatus: booking.paymentStatus || booking.payment_status || null,
    paymentMethod:
      booking.paymentMethod?.label ||
      booking.paymentMethod?.name ||
      booking.paymentMethod ||
      null,
    review: (() => {
      const raw = booking.review;
      const review =
        raw && typeof raw === "object"
          ? raw
          : booking.rating && typeof booking.rating === "object"
            ? booking.rating
            : null;
      const score =
        review?.score ??
        review?.rating ??
        (typeof booking.rating === "number" ? booking.rating : null) ??
        booking.customerRating ??
        null;
      const text =
        review?.comment ||
        review?.text ||
        booking.reviewComment ||
        "";
      const tags = Array.isArray(review?.tags) ? review.tags : [];
      const tipAmount =
        review?.tipAmount != null ? Number(review.tipAmount) : null;
      if (
        score == null &&
        !text &&
        !tags.length &&
        tipAmount == null
      ) {
        return null;
      }
      return {
        score: score != null ? Number(score) : null,
        text,
        tags,
        tipAmount,
        photoUrl: review?.photoUrl ?? null,
      };
    })(),
  };
}

function SectionLabel({ label, icon }) {
  return (
    <View style={styles.sectionLabelRow}>
      <CustomText
        label={label}
        removeTranslation
        fontSize={11}
        fontFamily={fonts.semiBold}
        color={COLORS.label}
        letterSpacing={0.8}
        textTransform="uppercase"
      />
      <Icons family="Ionicons" name={icon} size={18} color={COLORS.primary} />
    </View>
  );
}

function PayRow({ label, value, valueColor, info }) {
  return (
    <View style={styles.payRow}>
      <View style={styles.payLabelRow}>
        <CustomText
          label={label}
          removeTranslation
          fontSize={14}
          fontFamily={fonts.medium}
          color="#6B7280"
          containerStyle={{ flexShrink: 1 }}
        />
        {info ? (
          <View style={{ marginLeft: 6 }}>
            <Icons
              family="Ionicons"
              name="information-circle-outline"
              size={15}
              color="#9CA3AF"
            />
          </View>
        ) : null}
      </View>
      <CustomText
        label={value}
        removeTranslation
        fontSize={14}
        fontFamily={fonts.bold}
        color={valueColor || COLORS.text}
      />
    </View>
  );
}

export default function BookingViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const bookingId = params?.id ? String(params.id) : "";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      setError("Missing booking id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("Please sign in to view booking.");
        setBooking(null);
        return;
      }
      const res = await bookingApi.getById(token, bookingId);
      setBooking(mapBookingDetail(res));
    } catch (err) {
      setError(err?.message || "Could not load booking.");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const status = booking?.status || "Booked";
  const showCancel =
    status === "Booked" ||
    status === "Confirmed" ||
    status === "Assigned" ||
    status === "OnTheWay";
  const showTrack =
    status === "Booked" ||
    status === "Confirmed" ||
    status === "Assigned" ||
    status === "OnTheWay";
  const showRebook = status === "Cancelled";
  const showReview = status === "Completed";
  const showFooter = showCancel || showRebook;
  const pricing = booking?.pricing || {};

  const handleBookAgain = useCallback(() => {
    const slug = String(
      booking?.categorySlug || booking?.categoryName || booking?.title || "",
    ).toLowerCase();
    if (
      slug.includes("hair") ||
      slug.includes("salon") ||
      slug.includes("dress") ||
      slug.includes("beauty")
    ) {
      router.push({
        pathname: "/booking/bookHaircutService",
        params: { categorySlug: "hair-dressing" },
      });
      return;
    }
    router.push("/booking/propertyBooking");
  }, [booking, router]);

  const handleSubmitReview = useCallback(
    async ({ rating, tags, comment, tipAmount, photoUri }) => {
      if (!booking?.id || submittingReview) return;
      setSubmittingReview(true);
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert("Sign in required", "Please sign in to submit a review.");
          return;
        }
        const photoUrl = photoUri
          ? await resolvePhotoUrlViaProfileApi(token, photoUri)
          : null;
        const body = {
          rating: Number(rating),
          tags: Array.isArray(tags) ? tags : [],
          comment: comment || "",
          tipAmount: tipAmount == null ? null : Number(tipAmount),
          photoUrl,
        };
        await bookingApi.review(token, booking.id, body);
        setBooking((prev) =>
          prev
            ? {
                ...prev,
                review: {
                  score: body.rating,
                  tags: body.tags,
                  text: body.comment,
                  tipAmount: body.tipAmount,
                  photoUrl: body.photoUrl,
                },
              }
            : prev,
        );
        Alert.alert("Thank you", "Your review has been submitted.");
      } catch (err) {
        Alert.alert(
          "Could not submit review",
          err?.message || "Please try again.",
        );
      } finally {
        setSubmittingReview(false);
      }
    },
    [booking?.id, submittingReview],
  );

  const openTracking = useCallback(() => {
    if (!booking?.id && !bookingId) return;
    router.push({
      pathname: "/booking-tracking",
      params: {
        bookingId: String(booking?.id || bookingId || ""),
        bookingApiId: String(booking?.id || bookingId || ""),
        reference: booking?.reference || "",
        serviceTitle: booking?.title || "",
        categorySlug: booking?.categorySlug || "",
        appointment: booking?.appointmentTimeWithDuration || booking?.startTime || "",
        addressLine: booking?.addressLine || "",
        total:
          booking?.pricing?.total != null
            ? String(booking.pricing.total)
            : "",
      },
    });
  }, [booking, bookingId, router]);

  const handleCancel = useCallback(() => {
    if (!booking?.id || cancelling) return;
    Alert.alert(
      "Cancel booking?",
      "Are you sure you want to cancel this service?",
      [
        { text: "Keep booking", style: "cancel" },
        {
          text: "Cancel service",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              const token = await getToken();
              if (!token) {
                Alert.alert("Sign in required", "Please sign in to cancel.");
                return;
              }
              await bookingApi.cancel(token, booking.id);
              await loadBooking();
            } catch (err) {
              Alert.alert(
                "Could not cancel",
                err?.message || "Please try again.",
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  }, [booking?.id, cancelling, loadBooking]);

  const paymentRows = useMemo(() => {
    const rows = [];
    if (Array.isArray(pricing.lineItems) && pricing.lineItems.length) {
      pricing.lineItems.forEach((item, idx) => {
        const label = item?.label || item?.name || item?.title;
        const value =
          item?.value ??
          item?.amount ??
          (item?.free === true ? "FREE" : null);
        if (!label || value == null || value === "") return;
        rows.push({
          key: `line-${idx}`,
          label: String(label),
          value:
            typeof value === "number"
              ? money(value)
              : String(value).toUpperCase() === "FREE"
                ? "FREE"
                : String(value),
          valueColor:
            String(value).toUpperCase() === "FREE" || item?.free === true
              ? COLORS.free
              : COLORS.text,
          info: !!item?.info,
        });
      });
      return rows;
    }
    if (pricing.serviceAmount != null) {
      rows.push({
        key: "service",
        label: `${booking?.title || "Service"} Subtotal`,
        value: money(pricing.serviceAmount),
      });
    }
    if (pricing.addOnsAmount != null) {
      rows.push({
        key: "addons",
        label: "Add-ons",
        value: money(pricing.addOnsAmount),
      });
    }
    if (pricing.kitFee != null) {
      rows.push({
        key: "kit",
        label: "Safety & sterilized kit fee",
        value: Number(pricing.kitFee) === 0 ? "FREE" : money(pricing.kitFee),
        valueColor:
          Number(pricing.kitFee) === 0 ? COLORS.free : COLORS.text,
        info: true,
      });
    }
    if (pricing.serviceFee != null) {
      rows.push({
        key: "fee",
        label: "Service fee & taxes",
        value: money(pricing.serviceFee),
      });
    } else {
      if (pricing.taxes != null) {
        rows.push({
          key: "taxes",
          label: "Estimated Taxes",
          value: money(pricing.taxes),
        });
      }
    }
    if (pricing.travelFee != null && Number(pricing.travelFee) !== 0) {
      rows.push({
        key: "travel",
        label: "Travel fee",
        value: money(pricing.travelFee),
      });
    }
    return rows;
  }, [booking?.title, pricing]);

  const invoiceLine = [
    booking?.paymentStatus || null,
    booking?.reference ? `Invoice #${booking.reference}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/bookings");
          }}
        >
          <Icons
            family="Ionicons"
            name="chevron-back"
            size={26}
            color={COLORS.text}
          />
        </TouchableOpacity>
        {booking?.title ? (
          <CustomText
            label={booking.title}
            removeTranslation
            fontSize={18}
            fontFamily={fonts.bold}
            color={COLORS.text}
            numberOfLines={1}
            containerStyle={{ flex: 1, marginLeft: 2 }}
          />
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <View style={styles.stateWrap}>
          <CustomText
            label={error}
            removeTranslation
            fontSize={14}
            fontFamily={fonts.medium}
            color={COLORS.muted}
            textAlign="center"
          />
          <TouchableOpacity onPress={loadBooking} hitSlop={HIT_SLOP}>
            <CustomText
              label="Retry"
              removeTranslation
              fontSize={14}
              fontFamily={fonts.bold}
              color={COLORS.primary}
              marginTop={10}
              textAlign="center"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: showFooter ? 120 : showReview ? 48 : 40 },
          ]}
        >
          <StatusHero
            status={status}
            hasAssignee={!!booking?.hasAssignee}
            providerName={booking?.providerName}
            dateLabel={booking?.dateLabel}
            startTime={booking?.startTime}
            headline={booking?.headline}
            tracking={booking?.tracking}
            statusMessage={booking?.statusMessage}
            refundLabel={booking?.refundLabel}
            refundNote={booking?.refundNote}
            serviceRole={booking?.serviceRole}
          />

          {booking?.hasAssignee && booking?.providerName ? (
            <View style={styles.providerCard}>
              <View style={styles.avatarWrap}>
                {booking.providerImage ? (
                  <Image
                    source={{ uri: booking.providerImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Icons
                      family="Ionicons"
                      name="person-outline"
                      size={22}
                      color={COLORS.muted}
                    />
                  </View>
                )}
                <Image
                  source={images.successful}
                  style={styles.avatarVerifiedImg}
                />
              </View>
              <View style={styles.providerCopy}>
                <View style={styles.nameRow}>
                  <CustomText
                    label={booking.providerName}
                    removeTranslation
                    fontSize={16}
                    fontFamily={fonts.bold}
                    color={COLORS.text}
                    numberOfLines={1}
                    containerStyle={{ flexShrink: 1 }}
                  />
                  {booking.providerBadge ? (
                    <View style={styles.topPro}>
                      <CustomText
                        label={booking.providerBadge}
                        removeTranslation
                        fontSize={11}
                        fontFamily={fonts.semiBold}
                        color={COLORS.primary}
                      />
                    </View>
                  ) : null}
                </View>
                {booking.providerRating || booking.providerVehicle ? (
                  <View style={styles.metaRow}>
                    {booking.providerRating ? (
                      <>
                        <Icons
                          family="Ionicons"
                          name="star"
                          size={14}
                          color={COLORS.star}
                        />
                        <CustomText
                          label={booking.providerRating}
                          removeTranslation
                          fontSize={13}
                          fontFamily={fonts.medium}
                          color={COLORS.muted}
                          marginLeft={4}
                        />
                      </>
                    ) : null}
                    {booking.providerRating && booking.providerVehicle ? (
                      <CustomText
                        label="  ·  "
                        removeTranslation
                        fontSize={13}
                        fontFamily={fonts.medium}
                        color={COLORS.muted}
                      />
                    ) : null}
                    {booking.providerVehicle ? (
                      <CustomText
                        label={booking.providerVehicle}
                        removeTranslation
                        fontSize={13}
                        fontFamily={fonts.medium}
                        color={COLORS.muted}
                        numberOfLines={2}
                        containerStyle={{ flex: 1 }}
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
              {booking.providerPhone ? (
                <TouchableOpacity activeOpacity={0.85}>
                  <Image source={images.phone} style={styles.callBtnImg} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : status === "Booked" || status === "Confirmed" ? (
            <View style={styles.providerCard}>
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icons
                  family="Ionicons"
                  name="person-outline"
                  size={22}
                  color={COLORS.muted}
                />
              </View>
              <View style={styles.providerCopy}>
                <CustomText
                  label="Not assigned yet"
                  removeTranslation
                  fontSize={15}
                  fontFamily={fonts.semiBold}
                  color={COLORS.muted}
                />
              </View>
            </View>
          ) : null}

          {showTrack ? (
            <TouchableOpacity
              style={styles.trackCard}
              activeOpacity={0.85}
              onPress={openTracking}
            >
              <View style={styles.chatIcon}>
                <Icons
                  family="Ionicons"
                  name="navigate"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <CustomText
                label="Track booking"
                removeTranslation
                fontSize={15}
                fontFamily={fonts.bold}
                color={COLORS.text}
                containerStyle={{ flex: 1 }}
              />
              <Icons
                family="Ionicons"
                name="chevron-forward"
                size={18}
                color="#B0B8B4"
              />
            </TouchableOpacity>
          ) : null}

          {booking?.hasAssignee ? (
            <TouchableOpacity
              style={styles.chatCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/chat",
                  params: {
                    name: booking.providerName || "",
                    bookingId: booking.id || bookingId,
                  },
                })
              }
            >
              <View style={styles.chatIcon}>
                <Icons
                  family="Ionicons"
                  name="chatbubble-ellipses"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <CustomText
                label={
                  booking?.serviceRole?.chat || "Chat with your pro"
                }
                removeTranslation
                fontSize={15}
                fontFamily={fonts.bold}
                color={COLORS.text}
                containerStyle={{ flex: 1 }}
              />
              <Icons
                family="Ionicons"
                name="chevron-forward"
                size={18}
                color="#B0B8B4"
              />
            </TouchableOpacity>
          ) : null}

          {booking?.dateLabel || booking?.appointmentTimeWithDuration ? (
            <View style={styles.infoCard}>
              <SectionLabel label="APPOINTMENT TIME" icon="time-outline" />
              {booking.dateLabel ? (
                <CustomText
                  label={booking.dateLabel}
                  removeTranslation
                  fontSize={17}
                  fontFamily={fonts.bold}
                  color={COLORS.text}
                  marginTop={10}
                />
              ) : null}
              {booking.appointmentTimeWithDuration ? (
                <CustomText
                  label={booking.appointmentTimeWithDuration}
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.medium}
                  color={COLORS.muted}
                  marginTop={4}
                />
              ) : null}
            </View>
          ) : null}

          {booking?.addressLine || booking?.addressNotes ? (
            <View style={styles.infoCard}>
              <SectionLabel label="SERVICE LOCATION" icon="location-outline" />
              {booking.addressLine ? (
                <CustomText
                  label={booking.addressLine}
                  removeTranslation
                  fontSize={16}
                  fontFamily={fonts.bold}
                  color={COLORS.text}
                  marginTop={10}
                />
              ) : null}
              {booking.addressNotes ? (
                <CustomText
                  label={booking.addressNotes}
                  removeTranslation
                  fontSize={12}
                  fontFamily={fonts.medium}
                  color={COLORS.muted}
                  marginTop={6}
                  lineHeight={18}
                />
              ) : null}
              {booking.addressVerified ? (
                <View style={styles.verifiedTag}>
                  <Icons
                    family="Ionicons"
                    name="checkmark-circle"
                    size={15}
                    color={COLORS.primary}
                  />
                  <CustomText
                    label="Verified Home Access Saved"
                    removeTranslation
                    fontSize={12}
                    fontFamily={fonts.semiBold}
                    color={COLORS.primary}
                    marginLeft={6}
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {paymentRows.length > 0 || pricing.total != null ? (
            <View style={[styles.infoCard, styles.paymentCard]}>
              <CustomText
                label="Payment Summary"
                removeTranslation
                fontSize={18}
                fontFamily={fonts.bold}
                color={COLORS.text}
                marginBottom={16}
              />
              {paymentRows.map((row) => (
                <PayRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  valueColor={row.valueColor}
                  info={row.info}
                />
              ))}
              {pricing.total != null ? (
                <>
                  <View style={styles.payDivider} />
                  <View style={styles.totalRow}>
                    <View style={styles.totalLeft}>
                      <CustomText
                        label="Total Amount"
                        removeTranslation
                        fontSize={12}
                        fontFamily={fonts.medium}
                        color="#6B7280"
                        marginBottom={4}
                      />
                      <CustomText
                        label={money(pricing.total)}
                        removeTranslation
                        fontSize={30}
                        fontFamily={fonts.extraBold}
                        color={COLORS.text}
                      />
                    </View>
                    <View style={styles.totalRight}>
                      {booking?.paymentMethod ? (
                        <View style={styles.payMethod}>
                          <Icons
                            family="Ionicons"
                            name="card-outline"
                            size={15}
                            color={COLORS.text}
                          />
                          <CustomText
                            label={String(booking.paymentMethod)}
                            removeTranslation
                            fontSize={12}
                            fontFamily={fonts.semiBold}
                            color={COLORS.text}
                            marginLeft={6}
                          />
                          <View style={styles.payDot} />
                        </View>
                      ) : null}
                      {invoiceLine ? (
                        <CustomText
                          label={invoiceLine}
                          removeTranslation
                          fontSize={12}
                          fontFamily={fonts.semiBold}
                          color={COLORS.primary}
                          textAlign="right"
                          marginTop={10}
                        />
                      ) : null}
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          ) : null}

          {showReview ? (
            <ReviewCard
              providerName={booking?.providerName}
              roleLabel={booking?.serviceRole?.role}
              tags={
                String(booking?.serviceRole?.role || "")
                  .toLowerCase()
                  .includes("stylist")
                  ? STYLIST_TAGS
                  : CLEANING_TAGS
              }
              existingReview={booking?.review}
              submitting={submittingReview}
              onSubmit={handleSubmitReview}
              onBookAgain={handleBookAgain}
            />
          ) : null}
        </ScrollView>
      )}

      {showFooter && booking ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {showCancel ? (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.88}
              disabled={cancelling}
              onPress={handleCancel}
            >
              {cancelling ? (
                <ActivityIndicator color={COLORS.cancelText} />
              ) : (
                <>
                  <Icons
                    family="Ionicons"
                    name="close-circle-outline"
                    size={18}
                    color={COLORS.cancelText}
                  />
                  <CustomText
                    label="Cancel Service"
                    removeTranslation
                    fontSize={16}
                    fontFamily={fonts.bold}
                    color={COLORS.cancelText}
                    marginLeft={8}
                  />
                </>
              )}
            </TouchableOpacity>
          ) : null}
          {showRebook ? (
            <TouchableOpacity
              style={styles.rebookBtn}
              activeOpacity={0.88}
              onPress={handleBookAgain}
            >
              <Icons
                family="Ionicons"
                name="refresh"
                size={18}
                color="#FFFFFF"
              />
              <CustomText
                label="Rebook Service"
                removeTranslation
                fontSize={16}
                fontFamily={fonts.bold}
                color="#FFFFFF"
                marginLeft={8}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: COLORS.bg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  stateWrap: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#D8DFDB",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  payLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  paymentCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  totalLeft: {
    flexShrink: 0,
  },
  totalRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  payDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.free,
    marginLeft: 8,
  },
  // Status cards (success / on the way / cancel) — no #BEC9C1 stroke
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: COLORS.card,
    shadowColor: "#0E6E4C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroOnWay: {
    backgroundColor: COLORS.card,
  },
  heroCancel: {
    backgroundColor: COLORS.cancelBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroCopy: { flex: 1, paddingRight: 12 },
  heroCopyCompleted: { paddingLeft: 14, paddingRight: 4 },
  successImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  successImageInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  etaRangeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  etaRingWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  etaRingSvg: {
    position: "absolute",
  },
  etaRingCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  etaInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  etaInnerSolid: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  etaServiceIcon: {
    width: 26,
    height: 26,
    tintColor: COLORS.primary,
  },
  etaServiceIconLight: {
    width: 26,
    height: 26,
    tintColor: "#FFFFFF",
  },
  etaServiceIconFilled: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  onWayDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginTop: 16,
    marginBottom: 12,
  },

  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBadgeOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FAD9DC",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cancelText,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.cancelDivider,
    marginTop: 16,
    marginBottom: 14,
  },
  verifyBox: {
    marginTop: 14,
    backgroundColor: "#EAF4F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  verifyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  refundRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  refundSeal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.cancelText,
    alignItems: "center",
    justifyContent: "center",
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  avatarWrap: {
    width: 58,
    height: 58,
  },
  avatar: { width: 58, height: 58, borderRadius: 29 },
  avatarPlaceholder: {
    backgroundColor: "#D8E4DE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarVerifiedImg: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  providerCopy: { flex: 1, marginLeft: 14, marginRight: 12, minWidth: 0 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  topPro: {
    backgroundColor: "#E4F4EC",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C5CEC9",
    marginHorizontal: 7,
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.callBg,
    alignItems: "center",
    justifyContent: "center",
  },
  callBtnImg: {
    width: 48,
    height: 48,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  chatIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  payDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginTop: 2,
    marginBottom: 16,
  },
  payMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  reviewCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardStroke,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tagChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  reviewInput: {
    marginTop: 14,
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: "#F5F7F6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: COLORS.text,
  },
  tipInput: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F5F7F6",
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: COLORS.text,
  },
  addPhotoBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewPhotoWrap: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F5F7F6",
  },
  reviewPhoto: {
    width: "100%",
    backgroundColor: "#EEF2F0",
  },
  reviewPhotoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewPhotoBtn: {
    paddingVertical: 4,
  },
  submitReviewBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewSubmitted: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bookAgainSoftBtn: {
    marginTop: 10,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rebookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.cancelBg,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.cancelDivider,
  },
});
