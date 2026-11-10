import { Platform } from "react-native";
import { authApi } from "./api";
import * as secureStorage from "./secureStorage";

const FCM_CACHE_KEY = "fcmDeviceToken";

async function getPushTokenFromExpoNotifications() {
  try {
    // Optional dependency — install with: npx expo install expo-notifications
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const Notifications = require("expo-notifications");
    if (!Notifications?.getDevicePushTokenAsync) return null;

    const permissions =
      await Notifications.getPermissionsAsync?.().catch(() => null);
    if (permissions && permissions.status !== "granted") {
      await Notifications.requestPermissionsAsync?.();
    }

    const device = await Notifications.getDevicePushTokenAsync();
    return device?.data ? String(device.data) : null;
  } catch (err) {
    console.log("[fcm] expo-notifications unavailable:", err?.message || err);
    return null;
  }
}

async function getOrCreateFallbackToken() {
  const existing = await secureStorage.getItem(FCM_CACHE_KEY);
  if (existing) return existing;
  const generated = `dev-${Platform.OS}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  await secureStorage.setItem(FCM_CACHE_KEY, generated);
  return generated;
}

/** Resolve a push token to send to backend (real FCM/APNs when available). */
export async function resolveFcmToken() {
  const push = await getPushTokenFromExpoNotifications();
  if (push) {
    await secureStorage.setItem(FCM_CACHE_KEY, push);
    return push;
  }
  return getOrCreateFallbackToken();
}

/**
 * Postman 12 — PUT /api/auth/fcm-token
 * Call after successful login. Never throws to caller.
 */
export async function registerFcmTokenWithBackend(authToken) {
  if (!authToken) return null;
  try {
    const token = await resolveFcmToken();
    const platform = Platform.OS === "ios" ? "ios" : "android";
    const data = await authApi.registerFcmToken(authToken, {
      token,
      platform,
    });
    console.log("[fcm] registered:", { platform, tokenPreview: token.slice(0, 18) });
    return data;
  } catch (err) {
    console.log("[fcm] register failed:", err?.message || err);
    return null;
  }
}
