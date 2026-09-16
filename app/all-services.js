import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { images } from '../assets/images/image';

const ALL_SERVICES = [
  { id: '1', label: 'Cleaning', icon: images.cleaningIcon, bg: '#EFE7FF', color: '#8A5CF6' },
  { id: '2', label: 'Repairing', icon: images.repairingIcon, bg: '#FFE9EC', color: '#FF6F91' },
  { id: '3', label: 'Painting', icon: images.paintingIcon, bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '4', label: 'Laundry', icon: images.laundryIcon, bg: '#FFF6DE', color: '#F5B301' },
  { id: '5', label: 'Appliance', icon: images.applianceIcon, bg: '#FFE4EC', color: '#FF6F91' },
  { id: '6', label: 'Plumbing', icon: images.plumbingIcon, bg: '#E6FBEF', color: '#2ECC71' },
  { id: '7', label: 'Shifting', icon: images.shiftingIcon, bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '8', label: 'Beauty', icon: images.beautyIcon, bg: '#F0EEFB', color: '#8A5CF6' },
  { id: '9', label: 'AC Repair', icon: images.acRepairIcon, bg: '#E6FBEF', color: '#2ECC71' },
  { id: '10', label: 'Vehicle', icon: images.vehicleRepairIcon, bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '11', label: 'Electronics', icon: images.electricianIcon, bg: '#FFF6DE', color: '#F5B301' },
  { id: '12', label: 'Massage', icon: images.massageIcon, bg: '#FFE4EC', color: '#FF6F91' },
  { id: '13', label: "Men's Salon", icon: images.mensSpaIcon, bg: '#F0EEFB', color: '#8A5CF6' },
];

export default function AllServicesScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 12 }]}>All Services</Text>
        </View>
        <TouchableOpacity>
        <Image source={images.moreIcon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {ALL_SERVICES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.item}
            onPress={() => router.push(`/category/${s.label}`)}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
              <Image source={s.icon} style={styles.serviceIcon} />
            </View>
            <Text style={styles.label} numberOfLines={1}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  searchIcon: { width: 24, height: 24, resizeMode: 'contain', },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 32,
    marginTop: 12,
  },
  item: { width: '25%', alignItems: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceIcon: { width: 24, height: 24, resizeMode: 'contain', },
  label: {
    fontSize: 13,
    color: '#000',
    fontWeight: '700',
    maxWidth: 70,
    textAlign: 'center',
  },
});