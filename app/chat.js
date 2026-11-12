import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "../assets/images/image";
import fonts from "../components/assets/fonts";
import CustomText from "../components/components/CustomText";
import Icons from "../components/components/Icons";

const COLORS = {
  primary: "#0E6E4C",
  primarySoft: "#E8F5EF",
  safetyBg: "#EAF6EF",
  bg: "#F4F7F5",
  card: "#FFFFFF",
  text: "#14332C",
  muted: "#8A948F",
  border: "#E6EBE8",
  inputBg: "#EEF5F1",
};

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const QUICK_REPLIES = [
  "I am at the door",
  "Please call upon arrival",
  "Gate code is 4421",
];

const STATIC_MESSAGES = [
  {
    id: "day",
    type: "day",
    label: "Today, 2:18 PM",
  },
  {
    id: "safety",
    type: "safety",
    text: "For your safety, always communicate and pay through the app. Never share sensitive personal info.",
  },
  {
    id: "1",
    type: "message",
    text: "Hello! I am on my way with the sanitized styling kit. I should arrive in about 15 minutes.",
    fromMe: false,
    time: "2:19 PM",
    showAvatar: true,
  },
  {
    id: "2",
    type: "message",
    text: "Sounds great! Please ring apartment bell 402 when you arrive downstairs.",
    fromMe: true,
    time: "2:21 PM",
    read: true,
  },
  {
    id: "3",
    type: "message",
    text: "Got it, apartment 402. See you shortly!",
    fromMe: false,
    time: "2:22 PM",
    showAvatar: true,
  },
];

function formatNow() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);

  const name = params?.name ? String(params.name) : "Ayesha Khan";
  const bookingId = params?.bookingId
    ? String(params.bookingId).startsWith("#")
      ? String(params.bookingId)
      : `#${params.bookingId}`
    : "#HS-92841";

  const [messages, setMessages] = useState(STATIC_MESSAGES);
  const [text, setText] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const appendMessage = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: "message",
        text: trimmed,
        fromMe: true,
        time: formatNow(),
        read: true,
      },
    ]);
    setText("");
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const renderItem = ({ item }) => {
    if (item.type === "day") {
      return (
        <CustomText
          label={item.label}
          removeTranslation
          fontSize={12}
          fontFamily={fonts.medium}
          color={COLORS.muted}
          textAlign="center"
          marginBottom={14}
          marginTop={4}
        />
      );
    }

    if (item.type === "safety") {
      return (
        <View style={styles.safetyBanner}>
          <View style={styles.safetyIcon}>
            <Icons
              family="Ionicons"
              name="shield-checkmark"
              size={16}
              color={COLORS.primary}
            />
          </View>
          <CustomText
            label={item.text}
            removeTranslation
            fontSize={12}
            fontFamily={fonts.medium}
            color={COLORS.primary}
            lineHeight={17}
            containerStyle={styles.safetyText}
          />
        </View>
      );
    }

    if (item.fromMe) {
      return (
        <View style={[styles.row, styles.rowMe]}>
          <View style={[styles.bubble, styles.bubbleMe]}>
            <CustomText
              label={item.text}
              removeTranslation
              fontSize={14}
              fontFamily={fonts.medium}
              color="#FFFFFF"
              lineHeight={20}
            />
          </View>
          <View style={styles.metaMe}>
            <CustomText
              label={item.time}
              removeTranslation
              fontSize={11}
              fontFamily={fonts.regular}
              color={COLORS.muted}
            />
            {item.read ? (
              <View style={{ marginLeft: 4 }}>
                <Icons
                  family="Ionicons"
                  name="checkmark-done"
                  size={14}
                  color={COLORS.primary}
                />
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.row, styles.rowThem]}>
        <View style={styles.themRow}>
          {item.showAvatar ? (
            <Image source={images.homecard1} style={styles.msgAvatar} />
          ) : (
            <View style={styles.msgAvatarSpacer} />
          )}
          <View style={styles.themCol}>
            <View style={[styles.bubble, styles.bubbleThem]}>
              <CustomText
                label={item.text}
                removeTranslation
                fontSize={14}
                fontFamily={fonts.medium}
                color={COLORS.text}
                lineHeight={20}
              />
            </View>
            <CustomText
              label={item.time}
              removeTranslation
              fontSize={11}
              fontFamily={fonts.regular}
              color={COLORS.muted}
              marginTop={4}
              marginLeft={4}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/home");
          }}
        >
          <Icons family="Ionicons" name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarWrap}>
            <Image source={images.homecard1} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerCopy}>
            <View style={styles.nameRow}>
              <CustomText
                label={name}
                removeTranslation
                fontSize={16}
                fontFamily={fonts.bold}
                color={COLORS.text}
                numberOfLines={1}
                containerStyle={{ flexShrink: 1 }}
              />
              <View style={{ marginLeft: 4 }}>
                <Icons
                  family="Ionicons"
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.primary}
                />
              </View>
            </View>
            <CustomText
              label={`Active now  ${bookingId}`}
              removeTranslation
              fontSize={12}
              fontFamily={fonts.regular}
              color={COLORS.muted}
              numberOfLines={1}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn} hitSlop={HIT_SLOP}>
          <Icons family="Ionicons" name="call" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn} hitSlop={HIT_SLOP}>
          <Icons
            family="Ionicons"
            name="ellipsis-vertical"
            size={18}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.quickChip}
                activeOpacity={0.85}
                onPress={() => appendMessage(reply)}
              >
                <CustomText
                  label={reply}
                  removeTranslation
                  fontSize={13}
                  fontFamily={fonts.semiBold}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachBtn} activeOpacity={0.85}>
              <Icons
                family="Ionicons"
                name="camera-outline"
                size={22}
                color={COLORS.primary}
              />
            </TouchableOpacity>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#9AA49E"
                value={text}
                onChangeText={setText}
                multiline
              />
              <TouchableOpacity style={styles.micBtn} hitSlop={HIT_SLOP}>
                <Icons
                  family="Ionicons"
                  name="mic-outline"
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              onPress={() => appendMessage(text)}
              disabled={!text.trim()}
              activeOpacity={0.85}
            >
              <Icons family="Ionicons" name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  flex: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 2,
    minWidth: 0,
  },
  avatarWrap: {
    width: 42,
    height: 42,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerCopy: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  moreBtn: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.safetyBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 18,
  },
  safetyIcon: {
    marginTop: 1,
    marginRight: 8,
  },
  safetyText: {
    flex: 1,
  },
  row: {
    marginBottom: 14,
    maxWidth: "88%",
  },
  rowMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  rowThem: {
    alignSelf: "flex-start",
  },
  themRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  themCol: {
    flexShrink: 1,
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  msgAvatarSpacer: {
    width: 28,
    marginRight: 8,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  bubbleThem: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 6,
  },
  metaMe: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginRight: 2,
  },
  composer: {
    backgroundColor: COLORS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  quickRow: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  quickChip: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    gap: 8,
  },
  attachBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  inputWrap: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: Platform.OS === "ios" ? 11 : 8,
    fontSize: 15,
    fontFamily: fonts.medium,
    color: COLORS.text,
  },
  micBtn: {
    width: 34,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
