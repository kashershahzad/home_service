import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { images } from '../assets/images/image';

const ROOMS = [
  { id: 'livingRoom', label: 'Living Room' },
  { id: 'terrace', label: 'Terrace' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'diningRoom', label: 'Dining Room' },
  { id: 'garage', label: 'Garage' },
];

function RoomRow({ label, count, onDecrement, onIncrement }) {
  return (
    <View style={styles.roomCard}>
      <Text style={styles.roomLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperButton} onPress={onDecrement} activeOpacity={0.7}>
          <Ionicons name="remove" size={18} color="#7310FF" />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{count}</Text>
        <TouchableOpacity style={styles.stepperButton} onPress={onIncrement} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color="#7310FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HouseCleaningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [counts, setCounts] = useState(() =>
    Object.fromEntries(ROOMS.map((room) => [room.id, 0]))
  );

  const updateCount = (id, delta) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleContinue = () => {
    router.push({
      pathname: '/booking-details',
      params: {
        id: params?.id,
        title: params?.title ?? 'House Cleaning',
        name: params?.name,
        price: params?.price,
        image: params?.image,
        cleaningItems: JSON.stringify(counts),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            >
              <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>House Cleaning</Text>
          </View>
          <TouchableOpacity>
            <Image source={images.moreIcon} style={styles.moreIcon} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Enter the number of items to be cleaned.</Text>

        {ROOMS.map((room) => (
          <RoomRow
            key={room.id}
            label={room.label}
            count={counts[room.id]}
            onDecrement={() => updateCount(room.id, -1)}
            onIncrement={() => updateCount(room.id, 1)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  moreIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    opacity: 0.7,
    marginBottom: 18,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 18,
    height: 68,
    marginBottom: 16,
    boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.05)',
  },
  roomLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    minWidth: 28,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 36,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: '0px 0px 22px 0px rgba(0, 0, 0, 0.10)',
  },
  primaryButton: {
    backgroundColor: '#7310FF',
    borderRadius: 40,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 15,
  },
});
