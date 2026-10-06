import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from "@expo/vector-icons";
import React from "react";

const Icons = ({ family, name, color, size, ...props }) => {
  let Family;
  switch (family) {
    case "AntDesign":
      Family = AntDesign;
      break;
    case "Entypo":
      Family = Entypo;
      break;
    case "EvilIcons":
      Family = EvilIcons;
      break;
    case "Feather":
      Family = Feather;
      break;
    case "FontAwesome":
      Family = FontAwesome;
      break;
    case "FontAwesome5":
    case "FontAwesome5Pro":
      Family = FontAwesome5;
      break;
    case "FontAwesome6":
      Family = FontAwesome6;
      break;
    case "Fontisto":
      Family = Fontisto;
      break;
    case "Foundation":
      Family = Foundation;
      break;
    case "Ionicons":
      Family = Ionicons;
      break;
    case "MaterialCommunityIcons":
      Family = MaterialCommunityIcons;
      break;
    case "MaterialIcons":
      Family = MaterialIcons;
      break;
    case "Octicons":
      Family = Octicons;
      break;
    case "SimpleLineIcons":
      Family = SimpleLineIcons;
      break;
    case "Zocial":
      Family = Zocial;
      break;
    default:
      Family = Ionicons;
  }

  return (
    <Family
      name={name || "help-outline"}
      color={color || "#000"}
      size={size || 14}
      {...props}
    />
  );
};

export default Icons;
