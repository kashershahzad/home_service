import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ALL_SERVICES = [
  { id: '1', label: 'Cleaning', icon: 'spray-bottle', bg: '#EFE7FF', color: '#8A5CF6' },
  { id: '2', label: 'Repairing', icon: 'tools', bg: '#FFE9EC', color: '#FF6F91' },
  { id: '3', label: 'Painting', icon: 'format-paint', bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '4', label: 'Laundry', icon: 'washing-machine', bg: '#FFF6DE', color: '#F5B301' },
  { id: '5', label: 'Appliance', icon: 'fridge-outline', bg: '#FFE4EC', color: '#FF6F91' },
  { id: '6', label: 'Plumbing', icon: 'pipe-wrench', bg: '#E6FBEF', color: '#2ECC71' },
  { id: '7', label: 'Shifting', icon: 'truck-outline', bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '8', label: 'Beauty', icon: 'lipstick', bg: '#F0EEFB', color: '#8A5CF6' },
  { id: '9', label: 'AC Repair', icon: 'air-conditioner', bg: '#E6FBEF', color: '#2ECC71' },
  { id: '10', label: 'Vehicle', icon: 'car-outline', bg: '#E4F6FF', color: '#3AAFFF' },
  { id: '11', label: 'Electronics', icon: 'television', bg: '#FFF6DE', color: '#F5B301' },
  { id: '12', label: 'Massage', icon: 'hand-heart-outline', bg: '#FFE4EC', color: '#FF6F91' },
  { id: '13', label: "Men's Salon", icon: 'account-tie', bg: '#F0EEFB', color: '#8A5CF6' },
];

export default function AllServicesScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 12 }]}>All Services</Text>
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.grid}>
        {ALL_SERVICES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.item}
            onPress={() => router.push(`/category/${s.label}`)}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
              <MaterialCommunityIcons name={s.icon} size={24} color={s.color} />
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
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
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
  label: {
    fontSize: 13,
    color: '#000',
    fontWeight: '700',
    maxWidth: 70,
    textAlign: 'center',
  },
});