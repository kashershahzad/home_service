import { NavigationContext } from "@react-navigation/native";
import React from "react";
import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ImageFast from "./ImageFast";

import { COLORS } from "../utils/COLORS";

const { width, height } = Dimensions.get("window");

const useIsFocusedSafe = () => {
  const navigation = React.useContext(NavigationContext);
  const [isFocused, setIsFocused] = React.useState(
    () => navigation?.isFocused?.() ?? true,
  );

  React.useEffect(() => {
    if (!navigation) {
      setIsFocused(true);
      return;
    }

    setIsFocused(navigation.isFocused());

    const unsubscribeFocus = navigation.addListener("focus", () => {
      setIsFocused(true);
    });
    const unsubscribeBlur = navigation.addListener("blur", () => {
      setIsFocused(false);
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return isFocused;
};

const FocusAwareStatusBar = ({ backgroundColor: _backgroundColor, translucent: _translucent, ...props }) => {
  const isFocused = useIsFocusedSafe();
  return isFocused ? <StatusBar barStyle="dark-content" {...props} /> : null;
};

const ScreenWrapper = ({
  children,
  statusBarColor = COLORS.mainBg,
  translucent = false,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor = COLORS.mainBg,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle = "dark-content",
  refreshControl,
  paddingBottom,
  nestedScrollEnabled,
  paddingHorizontal = 16,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = translucent ? 0 : insets.top;
  const bottomInset =
    paddingBottom !== undefined
      ? paddingBottom
      : Platform.OS === "android"
        ? insets.bottom
        : Math.max(insets.bottom, 10);

  const content = () => {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: topInset,
            paddingBottom: bottomInset,
            backgroundColor: backgroundImage ? "transparent" : backgroundColor,
          },
        ]}
      >
        <FocusAwareStatusBar barStyle={barStyle} />
        {headerUnScrollable()}

        {scrollEnabled ? (
          <KeyboardAwareScrollView
            nestedScrollEnabled={nestedScrollEnabled}
            refreshControl={refreshControl}
            style={[
              styles.container,
              {
                backgroundColor,
                paddingHorizontal,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </KeyboardAwareScrollView>
        ) : (
          <View style={{ paddingHorizontal, flex: 1 }}>{children}</View>
        )}
        {footerUnScrollable()}
      </View>
    );
  };
  return backgroundImage ? (
    <View style={{ width, height: height + 70, zIndex: 999 }}>
      {content()}
      <ImageFast
        source={backgroundImage}
        style={{
          width,
          height: height + 70,
          position: "absolute",
          zIndex: -1,
        }}
        resizeMode="cover"
      />
    </View>
  ) : (
    content()
  );
};

export default ScreenWrapper;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
