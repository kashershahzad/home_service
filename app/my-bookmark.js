import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { images } from '../assets/images/image';
import { useBookmarks } from '../context/BookmarkContext';

const COLORS = {
  primary: '#7310FF',
  text: '#000000',
  subtext: '#6B6B6B',
  star: '#FFB800',
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

export default function MyBookmarkScreen() {
  const router = useRouter();
  const { bookmarkedList, toggleBookmark } = useBookmarks();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [sheetMounted, setSheetMounted] = useState(false);
  const sheetY = useRef(new Animated.Value(500)).current;
  const isAnimating = useRef(false);

  const openSheet = (item) => {
    setPendingRemove(item);
    setSheetMounted(true);
    sheetY.setValue(500);
    isAnimating.current = true;
    Animated.timing(sheetY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const closeSheet = () => {
    if (isAnimating.current) return; 
    isAnimating.current = true;

    Animated.timing(sheetY, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSheetMounted(false);
      setPendingRemove(null);
      isAnimating.current = false;
    });
  };

  const confirmRemove = () => {
    if (pendingRemove) toggleBookmark(pendingRemove);
    closeSheet();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 90) {
          closeSheet();
        } else {
          Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;
  const categories = useMemo(() => {
    const set = new Set();
    bookmarkedList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [bookmarkedList]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'All') return bookmarkedList;
    return bookmarkedList.filter((item) => item.category === activeFilter);
  }, [bookmarkedList, activeFilter]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookmark</Text>
        <TouchableOpacity style={styles.moreBtn} hitSlop={HIT_SLOP}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <FilterChips
        categories={categories}
        activeFilter={activeFilter}
        onSelect={setActiveFilter}
      />

      <FlatList
        style={styles.list}
        data={filteredList}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No bookmarks yet. Tap the bookmark icon on any service to save it here.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
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
              onPress={() => openSheet(item)}
              hitSlop={HIT_SLOP}
              style={styles.bookmarkButton}
            >
              <Image source={ images.savedIcon} style={styles.saveIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {sheetMounted && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeSheet}
        >
          <View style={styles.overlay}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}
            >
              <View style={styles.dragArea}>
                <View style={styles.sheetHandle} />
              </View>
              <Pressable onPress={() => {}}>
                <Text style={styles.sheetTitle}>Remove from Bookmark?</Text>
                <View style={styles.sheetDivider} />

                {pendingRemove && (
                  <View style={styles.sheetCard}>
                    <Image source={{ uri: pendingRemove.image }} style={styles.sheetImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{pendingRemove.name}</Text>
                      <Text style={styles.serviceTitle}>{pendingRemove.title}</Text>
                      <Text style={styles.price}>Rs.{pendingRemove.price}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color={COLORS.star} />
                        <Text style={styles.ratingText}>
                          {pendingRemove.rating} | {pendingRemove.reviewsCount} reviews
                        </Text>
                      </View>
                    </View>
                    <Image source={ images.savedIcon} style={styles.saveIcon} />
                  </View>
                )}

                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    hitSlop={HIT_SLOP}
                    onPress={closeSheet}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    hitSlop={HIT_SLOP}
                    onPress={confirmRemove}
                  >
                    <Text style={styles.removeBtnText}>Yes, Remove</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function FilterChips({ categories, activeFilter, onSelect }) {
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterRow}
      renderItem={({ item: f }) => {
        const active = f === activeFilter;
        return (
          <TouchableOpacity
            onPress={() => onSelect(f)}
            hitSlop={HIT_SLOP}
            style={[styles.filterChip, active && styles.filterChipActive]}
          >
            <Text
              style={[styles.filterChipText, active && styles.filterChipTextActive]}
              numberOfLines={1}
            >
              {f}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexShrink: 0,
  },
  title: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginLeft: 14,
    flex: 1,
  },
  moreBtn: {
    width: 30,
    alignItems: 'flex-end',
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 40,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 10,
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: { fontSize: 12.5, fontWeight: '600', color: COLORS.primary },
  filterChipTextActive: { color: '#fff' },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: COLORS.subtext,
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  saveIcon: { width: 24, height: 24, resizeMode: 'contain', },
  image: { width: 90, height: 90, borderRadius: 16, marginRight: 14 },
  name: { fontSize: 13, color: COLORS.subtext },
  serviceTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 3 },
  price: { fontSize: 14.5, color: COLORS.primary, fontWeight: '700', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 11.5, color: COLORS.subtext, marginLeft: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    minHeight: 380,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  dragArea: {
    paddingTop: 4,
    paddingBottom: 14,
    marginBottom: 6,
  },
  sheetTitle: {
    fontFamily: 'Roboto_800ExtraBold',
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginTop: 0,
    marginBottom: 20,
  },
  sheetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    minHeight: 130,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sheetImage: { width: 72, height: 72, borderRadius: 16, marginRight: 14 },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  removeBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});