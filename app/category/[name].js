import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { serviceApi } from '../../utils/api';
import { useBookmarks } from '../../context/BookmarkContext';

const COLORS = {
  primary: '#7310FF',
  text: '#000000',
  subtext: '#6B6B6B',
  star: '#FFB800',
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

export default function CategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      try {
        const data = await serviceApi.getByCategory(name);
        if (isMounted) setProviders(data.providers || []);
      } catch (err) {
        console.log('Could not load category:', err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProviders();
    return () => { isMounted = false; };
  }, [name]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity hitSlop={HIT_SLOP} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <TouchableOpacity hitSlop={HIT_SLOP}>
          <Feather name="search" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : providers.length === 0 ? (
        <Text style={styles.emptyText}>No service available for this category.</Text>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/service/${item._id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.price}>Rs.{item.price}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color={COLORS.star} />
                  <Text style={styles.ratingText}>
                    {item.rating} | {item.reviewsCount} reviews
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={() => toggleBookmark(item)}
              >
                <Ionicons
                  name={isBookmarked(item._id) ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#6B6B6B',
    fontSize: 14,
    paddingHorizontal: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    minHeight: 116,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  image: { width: 90, height: 90, borderRadius: 16, marginRight: 14 },
  name: { fontSize: 13, color: '#6B6B6B' },
  serviceTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 3 },
  price: { fontSize: 14.5, color: '#7310FF', fontWeight: '700', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 11.5, color: '#6B6B6B', marginLeft: 4 },
});