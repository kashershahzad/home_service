import { View } from "react-native";

export const PROVIDER_GOOGLE = "google";

export function MapView({ children, style, ...rest }) {
  return (
    <View style={[{ flex: 1, backgroundColor: "#E8EEF0" }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Marker() {
  return null;
}
