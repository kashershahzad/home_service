import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export async function setItem(key, value) {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key) {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
