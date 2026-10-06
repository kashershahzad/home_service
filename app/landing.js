import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "../assets/images/image";
import fonts from "../components/assets/fonts";
import CustomText from "../components/components/CustomText";
import FeaturedServiceCard from "../components/components/FeaturedServiceCard";
import ScreenWrapper from "../components/components/ScreenWrapper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TRUST_GAP = 8;
const TRUST_PAD = 16;
const TRUST_CARD_WIDTH = (SCREEN_WIDTH - TRUST_PAD * 2 - TRUST_GAP * 2) / 3;

const TRUST_CARDS = [
  {
    id: "vetted",
    icon: images.vetted,
    title: "100% Vetted",
    subtitle: "Enhanced Criminal Check",
  },
  {
    id: "kits",
    icon: images.kits,
    title: "Autoclaved Kits",
    subtitle: "Hospital-Grade Sterilization",
  },
  {
    id: "indemnity",
    icon: images.mark,
    title: "Full Indemnity",
    subtitle: "£5M / Rs 50M Insured",
  },
];

const OPERATE_STEPS = [
  {
    id: "01",
    title: "Select Protocol & Window",
    description:
      "Choose custom specifications, square footage, or salon preferences with direct calendar lock.",
  },
  {
    id: "02",
    title: "Sterilized White-Glove Dispatch",
    description:
      "Technicians arrive with biometric ID, sealed autoclaved gear, and shoe barriers. Real-time GPS tracker.",
  },
  {
    id: "03",
    title: "Signed Digital Inspection",
    description:
      "Review room-by-room photographic metrics. Billing is settled only after client digital sign-off.",
  },
];

const FOOTER_SERVICES = [
  "Deep Sanitization",
  "Cosmetology & Hair",
  "Artisan Laundry",
  "HVAC & Appliances",
];

const FOOTER_ASSURANCE = [
  "Indemnity Policy",
  "Staff Vetting Standards",
  "Diplomatic Discretion",
  "Concierge Hotline",
];

const FEATURED_FILTERS = [
  { id: "all", label: "All" },
  { id: "cleaning", label: "Cleaning & Sterilization" },
  { id: "salon", label: "Salon & Beauty" },
];

const FEATURED_SERVICES = [
  {
    id: "1",
    category: "cleaning",
    image: images.landing1,
    tag: "HEPA & Steam Extraction",
    price: "From Rs  2,000  /  £65",
    title: "Home & Deep Sanitization",
    description:
      "Multi-stage airborne dust eradication, microfiber steam extraction, and anti-allergen fogging.",
    rating: "4.98",
    reviews: "320+ audits",
  },
  {
    id: "2",
    category: "salon",
    image: images.landing2,
    tag: "Dyson  &  Organic Keratin",
    price: "From Rs  1,500  /  £55",
    title: "At-Home Master Hair & Cosmetology",
    description:
      "Sassoon-trained stylists, botanical scalp therapy, restorative blowouts, and bridal dressing.",
    rating: "4.99",
    reviews: "480+ styling",
  },
  {
    id: "3",
    category: "cleaning",
    image: images.landing3,
    tag: "24h Turnaround  ·  Cashmere",
    price: "From Rs  1,200  /  £40",
    title: "Artisan Laundry & Crisp Press",
    description:
      "Temperature-controlled enzyme washing, delicate fabric inspection, and hand-rolled packing.",
    rating: "4.95",
    reviews: "210+ orders",
  },
];

const PROTOCOLS = [
  "Home & Deep Sanitization Protocol",
  "Premium Home Cleaning Protocol",
  "Hair & Salon Protocol",
];

export default function LandingScreen() {
  const router = useRouter();
  const [protocol, setProtocol] = useState(PROTOCOLS[0]);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const featuredServices =
    featuredFilter === "all"
      ? FEATURED_SERVICES
      : FEATURED_SERVICES.filter((item) => item.category === featuredFilter);

  return (
    <ScreenWrapper
      backgroundColor="#FFFFFF"
      statusBarColor="#FFFFFF"
      paddingHorizontal={0}
      paddingBottom={0}
      scrollEnabled
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={images.landinglogo} style={styles.logo} />
            <View>
              <CustomText
                label="Homely"
                fontSize={18}
                fontFamily={fonts.bold}
                color="#005445"
              />
              <View style={styles.locationRow}>
                <Image
                  source={images.landinglocation}
                  style={styles.locationIcon}
                />
                <CustomText
                  label="Lahore & London"
                  fontSize={10}
                  fontFamily={fonts.regular}
                  color="#46645C"
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/letYouIn")}
            >
              <CustomText
                label="Log In"
                fontSize={13}
                fontFamily={fonts.medium}
                color="#005445"
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/letYouIn")}
              style={styles.bookBtn}
            >
              <CustomText
                label="Book Now"
                fontSize={13}
                fontFamily={fonts.medium}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <ImageBackground
          source={images.landingcover}
          style={styles.hero}
          imageStyle={styles.heroBgImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Image source={images.mark2} style={styles.heroBadgeIcon} />
              <CustomText
                label="BESPOKE RESIDENTIAL STEWARDSHIP"
                fontSize={10}
                fontFamily={fonts.bold}
                color="#9BEDD6"
                letterSpacing={0.6}
              />
            </View>
            <CustomText
              label="Luxury Home Care & Styling, Delivered to Your Doorstep."
              fontSize={28}
              fontFamily={fonts.bold}
              color="#FFFFFF"
              marginTop={12}
              lineHeight={32}
            />
            <CustomText
              label="Hospital-grade deep sanitization, master hair styling, and certified white-glove estate care."
              fontSize={13}
              fontFamily={fonts.regular}
              color="#E5E9E7E5"
              marginTop={8}
              lineHeight={20}
            />
          </View>
        </ImageBackground>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Image source={images.calender} style={styles.calendarIcon} />
              <CustomText
                label="Reserve Concierge Protocol"
                fontSize={14}
                fontFamily={fonts.semiBold}
                color="#005445"
                numberOfLines={2}
                containerStyle={styles.titleTextWrap}
              />
            </View>
            <View style={styles.instantBadge}>
              <CustomText
                label="Instant Confirm"
                fontSize={10}
                fontFamily={fonts.regular}
                color="#46645C"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <CustomText
            label="Select Protocol Suite"
            fontSize={11}
            fontFamily={fonts.medium}
            color="#3E4945"
            marginBottom={8}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setProtocolOpen((open) => !open)}
            style={styles.field}
          >
            <CustomText
              label={protocol}
              fontSize={13}
              fontFamily={fonts.regular}
              color="#181D1C"
            />
            <Image source={images.downarrow} style={styles.downArrow} />
          </TouchableOpacity>
          {protocolOpen ? (
            <View style={styles.dropdown}>
              {PROTOCOLS.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setProtocol(item);
                    setProtocolOpen(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <CustomText
                    label={item}
                    fontSize={11}
                    fontFamily={fonts.regular}
                    color="#181D1C"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <CustomText
            label="Residential Zone"
            fontSize={11}
            fontFamily={fonts.regular}
            color="3E4945"
            marginTop={14}
            marginBottom={8}
          />
          <View style={styles.field}>
            <CustomText
              label="Lahore: DHA Phase 1-8 & Raya Greens"
              fontSize={13}
              fontFamily={fonts.regular}
              color="#181D1C"
            />
            <Image source={images.residential} style={styles.buildingIcon} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/letYouIn")}
            style={styles.slotsBtn}
          >
            <Image source={images.time} style={styles.timeIcon} />
            <CustomText
              label="Check Real-Time Slots"
              fontSize={13}
              fontFamily={fonts.semiBold}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={TRUST_CARDS}
          keyExtractor={(item) => item.id}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.trustListWrap}
          contentContainerStyle={styles.trustList}
          renderItem={({ item }) => (
            <View style={[styles.trustCard, { width: TRUST_CARD_WIDTH }]}>
              <Image source={item.icon} style={styles.trustIcon} />
              <CustomText
                label={item.title}
                fontSize={10}
                fontFamily={fonts.semiBold}
                color="#181D1C"
                textAlign="center"
                marginTop={8}
                containerStyle={styles.trustText}
              />
              <CustomText
                label={item.subtitle}
                fontSize={9}
                fontFamily={fonts.regular}
                color="#3E4945"
                textAlign="center"
                marginTop={4}
                containerStyle={styles.trustText}
              />
            </View>
          )}
        />

        <View style={styles.featuredSection}>
          <CustomText
            label="Featured Service"
            fontSize={28}
            fontFamily={fonts.bold}
            color="#181D1C"
          />
          <CustomText
            label="Suits"
            fontSize={28}
            fontFamily={fonts.bold}
            color="#181D1C"
          />
          <View style={styles.filterRow}>
            {FEATURED_FILTERS.map((filter) => {
              const active = featuredFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  activeOpacity={0.8}
                  onPress={() => setFeaturedFilter(filter.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <CustomText
                    label={filter.label}
                    fontSize={12}
                    fontFamily={active ? fonts.bold : fonts.medium}
                    color={active ? "#FFFFFF" : "#3E4945"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <FlatList
            data={featuredServices}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.featuredCardWrap}>
                <FeaturedServiceCard
                  item={item}
                  onPress={() => router.push("/letYouIn")}
                />
              </View>
            )}
          />
        </View>

        <View style={styles.operateCard}>
          <CustomText
            label="EFFORTLESS ORDER"
            fontSize={11}
            fontFamily={fonts.semiBold}
            color="#005445"
            letterSpacing={0.8}
          />
          <CustomText
            label="How Homely Operates"
            fontSize={28}
            fontFamily={fonts.bold}
            color="#181D1C"
            marginTop={6}
          />
          {OPERATE_STEPS.map((step, index) => (
            <View key={step.id}>
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <CustomText
                    label={step.id}
                    fontSize={12}
                    fontFamily={fonts.bold}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.stepCopy}>
                  <CustomText
                    label={step.title}
                    fontSize={15}
                    fontFamily={fonts.bold}
                    color="#181D1C"
                  />
                  <CustomText
                    label={step.description}
                    fontSize={13}
                    fontFamily={fonts.regular}
                    color="#3E4945"
                    marginTop={4}
                    lineHeight={18}
                  />
                </View>
              </View>
              {index < OPERATE_STEPS.length - 1 ? (
                <View style={styles.stepDivider} />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.footerBlock}>
          <View style={styles.footerBrand}>
            <Image source={images.landinglogo} style={styles.footerLogo} />
            <CustomText
              label="Homely Services"
              fontSize={18}
              fontFamily={fonts.bold}
              color="#005445"
            />
          </View>
          <CustomText
            label="Pristine estate stewardship, hospital-grade environmental sanitization, and bespoke cosmetology across dual heritage hubs: Lahore and London."
            fontSize={13}
            fontFamily={fonts.regular}
            color="#3E4945"
            marginTop={8}
            lineHeight={20}
          />

          <View style={styles.footerCols}>
            <View style={styles.footerCol}>
              <CustomText
                label="SERVICES"
                fontSize={11}
                fontFamily={fonts.bold}
                color="#005445"
                letterSpacing={0.6}
                marginBottom={8}
              />
              {FOOTER_SERVICES.map((item) => (
                <CustomText
                  key={item}
                  label={item}
                  fontSize={12}
                  fontFamily={fonts.regular}
                  color="#3E4945"
                  marginBottom={6}
                />
              ))}
            </View>
            <View style={styles.footerCol}>
              <CustomText
                label="ASSURANCE"
                fontSize={11}
                fontFamily={fonts.bold}
                color="#005445"
                letterSpacing={0.6}
                marginBottom={8}
              />
              {FOOTER_ASSURANCE.map((item) => (
                <CustomText
                  key={item}
                  label={item}
                  fontSize={12}
                  fontFamily={fonts.regular}
                  color="#3E4945"
                  marginBottom={6}
                />
              ))}
            </View>
          </View>

          <View style={styles.conciergeCard}>
            <View>
              <CustomText
                label="24/7 Priority Concierge"
                fontSize={10}
                fontFamily={fonts.bold}
                color="#46645C"
              />
              <CustomText
                label="+44  20  7946  0192"
                fontSize={12}
                fontFamily={fonts.bold}
                color="#005445"
                marginTop={4}
              />
            </View>
            <Image source={images.phone} style={styles.phoneIcon} />
          </View>

          <View style={styles.secureRow}>
            <View style={styles.secureItem}>
              <Image source={images.mark3} style={styles.secureIcon} />
              <CustomText
                label="ISO  9001  Certified"
                fontSize={11}
                fontFamily={fonts.medium}
                color="#6B7C76"
              />
            </View>
            <View style={styles.secureItem}>
              <Image source={images.lock} style={styles.secureIcon} />
              <CustomText
                label="256-Bit  SSL  Secured"
                fontSize={10}
                fontFamily={fonts.regular}
                color="#46645C"
              />
            </View>
          </View>
          <CustomText
            label="©  2026 Homely Services International Ltd. All rights reserved."
            fontSize={11}
            fontFamily={fonts.regular}
            color="#3E4945B2"
            textAlign="center"
            marginTop={10}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6FAF8",
    paddingBottom: 24,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 280,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroBgImage: {
    borderRadius: 16,
  },
  heroOverlay: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 80,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#C8EADF33",
    borderWidth: 1,
    borderColor: "#C8EADF4D",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeIcon: {
    width: 11,
    height: 10,
    resizeMode: "contain",
    marginTop: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    resizeMode: "contain",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationIcon: {
    width: 8,
    height: 10,
    resizeMode: "contain",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bookBtn: {
    backgroundColor: "#0E6E5C",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6EEEB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    paddingRight: 4,
  },
  titleTextWrap: {
    flex: 1,
  },
  calendarIcon: {
    width: 12,
    height: 13,
    resizeMode: "contain",
    tintColor: "#064E3B",
  },
  instantBadge: {
    borderWidth: 1,
    borderColor: "#F0F5F2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E9E7",
    marginVertical: 14,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F8F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  downArrow: {
    width: 10,
    height: 6,
    resizeMode: "contain",
    tintColor: "#46645C",
  },
  buildingIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    tintColor: "#46645C",
  },
  dropdown: {
    backgroundColor: "#F3F8F5",
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  slotsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0E6E5C",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 16,
  },
  timeIcon: {
    width: 11,
    height: 11,
    resizeMode: "contain",
    tintColor: "#FFFFFF",
    marginTop: 2,
  },
  trustListWrap: {
    flexGrow: 0,
    marginTop: 14,
  },
  trustList: {
    paddingHorizontal: TRUST_PAD,
    gap: TRUST_GAP,
    alignItems: "stretch",
  },
  trustCard: {
    backgroundColor: "#F0F5F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BEC9C433",
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 110,
  },
  trustIcon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  trustText: {
    width: "100%",
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: "#EAEFED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  filterChipActive: {
    backgroundColor: "#005445",
  },
  featuredCardWrap: {
    marginBottom: 14,
  },
  operateCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#F0F5F2",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BEC9C44D",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 18,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#005445",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepCopy: {
    flex: 1,
    paddingTop: 2,
  },
  stepDivider: {
    height: 1,
    backgroundColor: "#E5E9E7",
    marginTop: 16,
  },
  footerBlock: {
    backgroundColor: "#BEC9C44D",
    borderTopWidth: 1,
    borderTopColor: "#BEC9C44D",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    marginTop: 24,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLogo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  footerCols: {
    flexDirection: "row",
    marginTop: 18,
    gap: 24,
  },
  footerCol: {
    flex: 1,
  },
  conciergeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BEC9C44D",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 18,
  },
  phoneIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E6EEEB",
  },
  secureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secureIcon: {
    width: 11,
    height: 10,
    resizeMode: "contain",
    tintColor: "#6B7C76",
  },
});
