import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";

import { getToken } from "../utils/constants";

// Firebase messaging is optional — project does not include @react-native-firebase
const BrainBox = ({ children }) => {
  const navigation = useNavigation();

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    // Push notification deep-links require Firebase setup.
    // Kept as no-op so imports resolve without native Firebase.
    void navigation;
  }, [navigation]);

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default BrainBox;
