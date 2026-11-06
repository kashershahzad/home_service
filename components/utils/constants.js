import * as secureStorage from "../../utils/secureStorage";

export const getToken = async () => {
  try {
    return await secureStorage.getItem("authToken");
  } catch {
    return null;
  }
};
