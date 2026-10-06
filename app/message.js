import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#7310FF",
  primarySoft: "#F1E7FF",
  bg: "#F6FAF8",
  card: "#FFFFFF",
  text: "#000000",
  subtext: "#6B6B6B",
  border: "#EEEEEE",
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const INITIAL_MESSAGES = [
  {
    id: "1",
    text: "Hi! Thanks for reaching out. How can I help you today?",
    fromMe: false,
    time: "10:00 AM",
  },
  {
    id: "2",
    text: "Hello, I want to book this service. Is this price final?",
    fromMe: true,
    time: "10:02 AM",
  },
  {
    id: "3",
    text: "Yes, that's our floor price. Final amount may vary slightly based on work details.",
    fromMe: false,
    time: "10:03 AM",
  },
  {
    id: "4",
    text: "Great. Are you available this weekend?",
    fromMe: true,
    time: "10:05 AM",
  },
];

export default function MessageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listRef = useRef(null);

  const providerName = params?.name ? String(params.name) : "Provider";
  const providerTitle = params?.title ? String(params.title) : "Service";
  const providerImage = params?.image ? String(params.image) : null;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;

    const newMsg = {
      id: String(Date.now()),
      text: trimmed,
      fromMe: true,
      time: `${h12}:${minutes} ${ampm}`,
    };

    setMessages((prev) => [...prev, newMsg]);
    setText("");

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/home");
          }}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {providerImage ? (
            <Image source={{ uri: providerImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {providerName}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {providerTitle}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="call-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleWrap,
                item.fromMe ? styles.bubbleWrapMe : styles.bubbleWrapThem,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.fromMe ? styles.bubbleMe : styles.bubbleThem,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    item.fromMe && styles.bubbleTextMe,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                style={[
                  styles.time,
                  item.fromMe ? styles.timeMe : styles.timeThem,
                ]}
              >
                {item.time}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} hitSlop={HIT_SLOP}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#A0A0A0"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
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
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  bubbleWrap: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  bubbleWrapMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleWrapThem: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14.5,
    color: COLORS.text,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: "#fff",
  },
  time: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 4,
  },
  timeMe: { marginRight: 4 },
  timeThem: { marginLeft: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    color: COLORS.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
