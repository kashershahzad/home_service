import * as SecureStore from "expo-secure-store";

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync("authToken");
  } catch {
    return null;
  }
};
