import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const notifications = [
  {
    section: 'Today',
    items: [
      {
        id: '1',
        title: 'Payment Successful!',
        subtitle: 'You have made a services payment',
        color: '#7C5CFC',
        icon: 'credit-card',
        iconLib: 'feather',
      },
      {
        id: '2',
        title: 'New Category Services!',
        subtitle: 'Now the plumbing service is available',
        color: '#F0577E',
        icon: 'grid',
        iconLib: 'feather',
      },
    ],
  },
  {
    section: 'Yesterday',
    items: [
      {
        id: '3',
        title: "Today's Special Offers",
        subtitle: 'You get a special promo today',
        color: '#F0AC1D',
        icon: 'ticket-percent-outline',
        iconLib: 'mci',
      },
    ],
  },
  {
    section: 'December 2, 2026',
    items: [
      {
        id: '4',
        title: 'Credit Card Connected!',
        subtitle: 'Credit card has been linked!',
        color: '#7C5CFC',
        icon: 'credit-card',
        iconLib: 'feather',
      },
      {
        id: '5',
        title: 'Account Setup Successful!',
        subtitle: 'Your account has been created!',
        color: '#2FBE79',
        icon: 'user',
        iconLib: 'feather',
      },
    ],
  },
];
function IconWithDots({ color, icon, iconLib }) {
  return (
    <View style={styles.iconWrapper}>
      <View style={[styles.dotSmall, { backgroundColor: color }]} />
      <View style={[styles.dotTiny, { backgroundColor: color }]} />
      <View style={[styles.dotMicro, { backgroundColor: color }]} />
      <View style={[styles.dotBig, { backgroundColor: color }]} />
      <View style={[styles.dotRight, { backgroundColor: color }]} />
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        {iconLib === 'mci' ? (
          <MaterialCommunityIcons name={icon} size={20} color="#fff" />
        ) : (
          <Feather name={icon} size={20} color="#fff" />
        )}
      </View>
    </View>
  );
}

function NotificationCard({ item }) {
  return (
    <View style={styles.card}>
      <IconWithDots color={item.color} icon={item.icon} iconLib={item.iconLib} />
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.headerIconBtn} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
          <Feather name="more-horizontal" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((section) => (
          <View key={section.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item) => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerIconBtn: {
    width: 34,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    marginRight: 14,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSmall: {
    position: 'absolute',
    top: -6,
    left: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  dotTiny: {
    position: 'absolute',
    top: 10,
    left: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  dotMicro: {
    position: 'absolute',
    top: -8,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 2,
  },
  dotBig: {
    position: 'absolute',
    bottom: -6,
    left: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    zIndex: 2,
  },
  dotRight: {
    position: 'absolute',
    top: 4,
    right: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 2,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#000',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#000',
  },
});