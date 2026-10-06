import fonts from "../components/assets/fonts";
import BottomTabBar from "../components/components/BottomTabBar";
import CustomText from "../components/components/CustomText";
import ScreenWrapper from "../components/components/ScreenWrapper";

export default function WalletScreen() {
  return (
    <ScreenWrapper
      backgroundColor="#F6FAF8"
      statusBarColor="#F6FAF8"
      paddingBottom={0}
      footerUnScrollable={() => <BottomTabBar active="wallet" />}
    >
      <CustomText
        label="Wallet"
        fontSize={22}
        fontFamily={fonts.extraBold}
        color="#14332C"
        marginTop={10}
      />
      <CustomText
        label="Your wallet details will appear here."
        fontSize={13}
        fontFamily={fonts.medium}
        color="#526B63"
        marginTop={8}
      />
    </ScreenWrapper>
  );
}
