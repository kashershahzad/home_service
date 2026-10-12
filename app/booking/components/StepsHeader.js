import { Ionicons } from "@expo/vector-icons";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "../../../assets/fonts/fonts";

const ACCENT = "#0E6E4C";

export default function StepsHeader({
  title,
  onBack,
  step,
  total = 6,
  progressLabel,
  progressRight,
}) {
  const insets = useSafeAreaInsets();
  const percent = Math.round((step / total) * 100);
  const leftLabel = progressLabel || `Step ${step} of ${total}`;
  const rightLabel =
    progressRight !== undefined ? progressRight : `${percent}%`;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={ACCENT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>{leftLabel}</Text>
          <Text style={styles.progressRight}>{rightLabel}</Text>
        </View>
        <View style={styles.progressTrack}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < step && styles.progressSegmentActive,
                i === 0 && styles.progressSegmentFirst,
                i === total - 1 && styles.progressSegmentLast,
              ]}
            />
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  backButton: {
    width: 32,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: fonts.bold,
    color: "#111",
  },
  headerSpacer: {
    width: 32,
  },
  progressSection: {
    backgroundColor: "#F6FAF8",
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: "#6B7280",
    letterSpacing: 0.3,
  },
  progressRight: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#6B7280",
  },
  progressTrack: {
    flexDirection: "row",
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: ACCENT,
  },
  progressSegmentFirst: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  progressSegmentLast: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
