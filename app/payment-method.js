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

// Figma display sizes (1x); PNG assets are exported @3x
const METHODS = [
  { id: 'paypal', icon: images.paypalIcon, width: 23, height: 27 },
  { id: 'google', icon: images.googlePayIcon, width: 27, height: 27 },
  { id: 'apple', icon: images.applePayIcon, width: 23, height: 27 },
  { id: 'mastercard', icon: images.mastercardIcon, width: 31, height: 24 },
  { id: 'cash', icon: images.cashIcon, width: 28, height: 28 },
];

function RadioCircle({ selected }) {
  return (
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

function PaymentCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Image
          source={item.icon}
          style={{ width: item.width, height: item.height }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cardSpacer} />
      <RadioCircle selected={selected} />
    </TouchableOpacity>
  );
}

export default function PaymentMethodScreen() {
  const router = useRouter();
  useLocalSearchParams();
  const [selectedId, setSelectedId] = useState('mastercard');

  const handleContinue = () => {
    if (!selectedId) return;
    // Design-only — next screen not wired yet
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          >
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Payment Method</Text>
        </View>

        <Text style={styles.subtitle}>Select the payment method you want to use</Text>

        {METHODS.map((item) => (
          <PaymentCard
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onPress={() => setSelectedId(item.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !selectedId && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedId}
          activeOpacity={0.85}
        >
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
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    opacity: 0.7,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 68,
    paddingHorizontal: 18,
    marginBottom: 18,
    boxShadow: '0px 0px 22px 0px rgba(0, 0, 0, 0.10)',

  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSpacer: {
    flex: 1,
  },
  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7310FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#7310FF',
  },
  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#7310FF',
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
  primaryButtonDisabled: {
    backgroundColor: '#C9A8FF',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 15,
  },
});
