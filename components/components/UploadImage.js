import { Image, View, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";

import CustomModal from "./CustomModal";
import CustomText from "./CustomText";
import Icons from "./Icons";

import { Images } from "../assets/images";
import { COLORS } from "../utils/COLORS";
import fonts from "../assets/fonts";

const UploadImage = (props) => {
  const [image, setImage] = useState("");
  const [imageModal, setImageModal] = useState(false);

  const takePhotoFromCamera = async () => {
    try {
      setImageModal(false);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        ...props.options,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImage(asset);
        props.handleChange?.(asset);
      }
    } catch (error) {
      console.log("takePhotoFromCamera error", error);
    }
  };

  const takePhotoFromLibrary = async () => {
    try {
      setImageModal(false);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: !!props.multiple,
        selectionLimit: props.multiple ? 4 : 1,
        ...props.options,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = props.multiple ? result.assets : result.assets[0];
        setImage(props.multiple ? result.assets[0] : asset);
        props.handleChange?.(asset);
      }
    } catch (error) {
      console.log("takePhotoFromLibrary error", error);
    }
  };

  const ModalIcons = ({ source, title, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={source}
            style={{ width: 45, height: 45, resizeMode: "contain" }}
          />
        </View>
        <CustomText
          label={title}
          fontFamily={fonts.semiBold}
          marginTop={10}
          removeTranslation
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={!props.renderButton && styles.container}>
      {!props.renderButton ? (
        <>
          <View style={props.imageContainer}>
            <Image
              source={
                image
                  ? { uri: image.uri }
                  : props.image
                    ? { uri: props.image }
                    : props.placeholder || {
                        uri: "https://wtwp.com/wp-content/uploads/2015/06/placeholder-image.png",
                      }
              }
              style={styles.image}
            />
          </View>
          {!props.disabled && (
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.iconStyle, props.iconStyle]}
              onPress={() => setImageModal(true)}
            >
              <Icons
                family="Entypo"
                name="camera"
                color={props.iconColor || "black"}
                size={17}
              />
            </TouchableOpacity>
          )}
        </>
      ) : (
        props.renderButton(() => setImageModal(true))
      )}
      <CustomModal
        isChange
        isVisible={imageModal}
        transparent={true}
        onDisable={() => setImageModal(false)}
      >
        <View style={styles.mainContainer}>
          <Icons
            family="Entypo"
            name="circle-with-cross"
            size={25}
            color={COLORS.black}
            style={{ alignSelf: "flex-end", marginBottom: 10 }}
            onPress={() => setImageModal(false)}
          />
          <CustomText
            label="Choose Picture From"
            fontSize={18}
            fontFamily={fonts.bold}
            alignSelf="center"
            marginBottom={40}
            removeTranslation
          />
          <View style={styles.modalIconContainer}>
            <ModalIcons
              source={Images.gallery}
              title="Open Gallery"
              onPress={takePhotoFromLibrary}
            />
            <ModalIcons
              source={Images.camera}
              title="Open Camera"
              onPress={takePhotoFromCamera}
            />
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default UploadImage;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white,
    width: "100%",
    bottom: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconStyle: {
    position: "absolute",
    bottom: 15,
    right: 5,
    borderRadius: 50,
    backgroundColor: "white",
    padding: 5,
  },
  container: {
    alignSelf: "center",
  },
  modalIconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
});
