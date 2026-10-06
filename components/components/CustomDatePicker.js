import { Image, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import moment from "moment";

import CustomText from "./CustomText";

import { Images } from "../assets/images";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const CustomDatePicker = ({
  value,
  setValue,
  error,
  withLabel,
  labelColor,
  placeholder = "Date",
  type = "date",
}) => {
  const [isModal, setModal] = useState(false);
  const mode = type === "time" ? "time" : "date";

  const onChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setModal(false);
    }
    if (event.type === "dismissed") {
      setModal(false);
      return;
    }
    if (selectedDate) {
      setValue(selectedDate);
    }
    if (Platform.OS === "ios" && event.type === "set") {
      // keep open on iOS spinner until user dismisses via backdrop press elsewhere
    }
  };

  return (
    <>
      {withLabel && (
        <CustomText
          label={withLabel}
          marginBottom={8}
          color={labelColor || COLORS.black}
        />
      )}
      <TouchableOpacity
        onPress={() => setModal(true)}
        style={[
          styles.mainContainer,
          {
            marginBottom: error ? 5 : 20,
            borderColor: error ? COLORS.red : "transparent",
          },
        ]}
      >
        <CustomText
          label={
            value
              ? moment(value).format(type == "date" ? "DD/MM/YYYY" : "h:mm A")
              : placeholder
          }
          color={value ? COLORS.black : COLORS.inputLabel}
          removeTranslation
        />
        <Image
          source={type == "date" ? Images.calendar : Images.clock}
          style={[
            styles.rightIcon,
            { tintColor: value ? COLORS.primaryColor : "#9E9E9E" },
          ]}
        />
      </TouchableOpacity>
      {error && (
        <CustomText
          label={error}
          color={COLORS.red}
          fontFamily={fonts.semiBold}
          fontSize={10}
          marginBottom={15}
          removeTranslation
        />
      )}
      {isModal && (
        <DateTimePicker
          value={value instanceof Date ? value : new Date()}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}
    </>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
  },

  rightIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    right: 15,
    resizeMode: "contain",
  },
});
