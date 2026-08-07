import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBookmarks } from '../../context/BookmarkContext';
import { BASE_URL } from '../../utils/api'; 
const COLORS = {
  primary: '#7310FF',
  text: '#000000',
  subtext: '#6B6B6B',
  star: '#FFB800',
  chipBg: '#F1E7FF',
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };
const RATING_FILTERS = ['All', '5', '4', '3', '2', '1'];

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Today';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bookmarkedList, toggleBookmark } = useBookmarks();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [aboutTruncated, setAboutTruncated] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);

  const pinchScale = useRef(new Animated.Value(1)).current;
  const translateXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const baseScale = useRef(1);
  const baseTranslate = useRef({ x: 0, y: 0 });
  const lastDistance = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pinchScale.setValue(1);
    translateXY.setValue({ x: 0, y: 0 });
    baseScale.current = 1;
    baseTranslate.current = { x: 0, y: 0 };
    lastDistance.current = null;
  }, [viewerIndex]);

  const pinchResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const touches = evt.nativeEvent.touches;
        return touches.length === 2 || (touches.length === 1 && baseScale.current > 1);
      },
      onMoveShouldSetPanResponder: (evt) => {
        const touches = evt.nativeEvent.touches;
        return touches.length === 2 || (touches.length === 1 && baseScale.current > 1);
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        lastDistance.current = null;
        if (touches.length === 1) {
          dragStart.current = { x: touches[0].pageX, y: touches[0].pageY };
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (lastDistance.current == null) {
            lastDistance.current = distance;
          } else {
            const nextScale = Math.min(
              Math.max(baseScale.current * (distance / lastDistance.current), 1),
              4
            );
            pinchScale.setValue(nextScale);
          }
        } else if (touches.length === 1 && baseScale.current > 1) {
          const dx = touches[0].pageX - dragStart.current.x;
          const dy = touches[0].pageY - dragStart.current.y;
          translateXY.setValue({
            x: baseTranslate.current.x + dx,
            y: baseTranslate.current.y + dy,
          });
        }
      },
      onPanResponderRelease: () => {
        lastDistance.current = null;
        pinchScale.stopAnimation((val) => {
          baseScale.current = val;
          if (val <= 1) {
            baseTranslate.current = { x: 0, y: 0 };
            translateXY.setValue({ x: 0, y: 0 });
          }
        });
        translateXY.stopAnimation((val) => {
          baseTranslate.current = val;
        });
      },
      onPanResponderTerminate: () => {
        lastDistance.current = null;
      },
    })
  ).current;

  const isBookmarked = provider
    ? bookmarkedList.some((b) => b._id === provider._id)
    : false;

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/services/${id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (!res.ok) throw new Error('Failed to load service');
      const data = await res.json();
      setProvider(data.provider);
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);
  const handleBookNow = () => {
    if (!provider) return;
    router.push({
      pathname: '/booking-details',
      params: {
        id: provider._id,
        title: provider.title,
        name: provider.name,
        price: String(provider.price),
        image: provider.image,
      },
    });
  };

  const filteredReviews =
    reviewFilter === 'All'
      ? reviews
      : reviews.filter((r) => String(r.rating) === reviewFilter);

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !provider) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>{error || 'Service not found'}</Text>
        <TouchableOpacity onPress={fetchDetail} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasPhotos = provider.photos?.length > 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: provider.image }}
            style={styles.hero}
            resizeMode="cover"
            fadeDuration={200}
          />
          <View style={styles.heroTopBar}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.circleBtn}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{provider.title}</Text>
            <TouchableOpacity hitSlop={HIT_SLOP} onPress={() => toggleBookmark(provider)}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Provider row */}
          <View style={styles.providerRow}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <View style={styles.ratingInline}>
              <Ionicons name="star" size={13} color={COLORS.star} />
              <Text style={styles.ratingInlineText}>
                {provider.rating} ({provider.reviewsCount} reviews)
              </Text>
            </View>
          </View>

          {/* Category + location */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{provider.category}</Text>
            </View>
            {!!provider.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {provider.location}
                </Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs.{provider.price}</Text>
            <Text style={styles.priceLabel}> (Floor Price)</Text>
          </View>

          {/* About me */}
          {!!provider.about && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About me</Text>
              {!expanded && (
                <Text
                  style={[styles.aboutText, styles.aboutMeasure]}
                  pointerEvents="none"
                  onTextLayout={(e) => {
                    if (e.nativeEvent.lines.length > 3 && !aboutTruncated) {
                      setAboutTruncated(true);
                    } else if (e.nativeEvent.lines.length <= 3 && aboutTruncated) {
                      setAboutTruncated(false);
                    }
                  }}
                >
                  {provider.about}
                </Text>
              )}
              <Text style={styles.aboutText} numberOfLines={expanded ? undefined : 3}>
                {provider.about}
              </Text>
              {aboutTruncated && (
                <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
                  <Text style={styles.readMore}>{expanded ? 'Show less' : 'Read more...'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Photos */}
          {hasPhotos && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Photos</Text>
              <View style={styles.photoGrid}>
                {provider.photos.slice(0, 4).map((uri, idx) => {
                  const showSeeAll = idx === 1 && provider.photos.length > 4;
                  return (
                    <TouchableOpacity
                      key={`photo-wrap-${idx}`}
                      style={styles.photoItem}
                      activeOpacity={0.85}
                      onPress={() => setViewerIndex(idx)}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.photoThumb}
                        resizeMode="cover"
                      />
                      {showSeeAll && (
                        <View style={styles.seeAllOverlay}>
                          <Text style={styles.seeAllText}>See All</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Rating summary + filter chips */}
          <View style={[styles.section, { marginBottom: 8 }]}>
            <View style={styles.ratingSummaryRow}>
              <Ionicons name="star" size={16} color={COLORS.star} />
              <Text style={styles.ratingSummaryText}>
                {provider.rating} ({provider.reviewsCount} reviews)
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {RATING_FILTERS.map((r) => {
              const active = r === reviewFilter;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setReviewFilter(r)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  {r !== 'All' && (
                    <Ionicons
                      name="star"
                      size={12}
                      color={active ? '#fff' : COLORS.primary}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ marginTop: 16 }}>
            {filteredReviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews for this rating.</Text>
            ) : (
              <ScrollView
                style={styles.reviewsList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={true}
              >
                {filteredReviews.map((r) => (
                  <View key={r._id} style={styles.reviewRow}>
                    <Image
                      source={{ uri: r.avatar || 'https://via.placeholder.com/40' }}
                      style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.reviewHeaderRow}>
                        <Text style={styles.reviewerName}>{r.userName}</Text>
                        <View style={styles.reviewRatingBadge}>
                          <Ionicons name="star" size={11} color={COLORS.primary} />
                          <Text style={styles.reviewRatingText}>{r.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>{r.comment}</Text>
                      <View style={styles.reviewFooterRow}>
                        <Ionicons name="heart-outline" size={13} color={COLORS.subtext} />
                        <Text style={styles.reviewFooterText}>{r.likes}</Text>
                        <Text style={styles.reviewFooterDot}>·</Text>
                        <Text style={styles.reviewFooterText}>{timeAgo(r.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.messageBtn}>
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={viewerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
      >
        <TouchableOpacity
          style={styles.viewerBackdrop}
          activeOpacity={1}
          onPress={() => setViewerIndex(null)}
        >
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            style={styles.viewerCloseBtn}
            onPress={() => setViewerIndex(null)}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {viewerIndex !== null && (
            <View style={styles.viewerImageWrap} {...pinchResponder.panHandlers}>
              <Animated.Image
                source={{ uri: provider.photos[viewerIndex] }}
                style={[
                  styles.viewerImage,
                  {
                    transform: [
                      { translateX: translateXY.x },
                      { translateY: translateXY.y },
                      { scale: pinchScale },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          )}

          {provider.photos?.length > 1 && (
            <View style={styles.viewerNavRow}>
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                style={styles.viewerNavBtn}
                onPress={() =>
                  setViewerIndex((i) => (i - 1 + provider.photos.length) % provider.photos.length)
                }
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.viewerCounter}>
                {viewerIndex + 1} / {provider.photos.length}
              </Text>
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                style={styles.viewerNavBtn}
                onPress={() => setViewerIndex((i) => (i + 1) % provider.photos.length)}
              >
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  errorText: { color: COLORS.subtext, marginBottom: 12, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: '#fff', fontWeight: '700' },

  heroWrap: {
    width: '100%',
    height: 400,
  },
  hero: { width: '100%', height: '100%' },
  heroTopBar: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { paddingHorizontal: 20, paddingTop: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 25, fontWeight: '600', color: '#000', flex: 1, marginRight: 12 },

  providerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  providerName: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginRight: 10 },
  ratingInline: { flexDirection: 'row', alignItems: 'center' },
  ratingInlineText: { fontSize: 12.5, color: COLORS.subtext, marginLeft: 4 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  categoryBadge: {
    backgroundColor: COLORS.chipBg,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryBadgeText: { fontSize: 11.5, color: COLORS.primary, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  locationText: { fontSize: 15, color: '#000', fontWeight: '600', marginLeft: 5, flexShrink: 1 },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  priceLabel: { fontSize: 12.5, color: COLORS.subtext },

  section: { marginTop: 22, position: 'relative' },
  sectionLabel: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 8 },
  aboutText: { fontSize: 14.5, color: COLORS.subtext, lineHeight: 22 },
  aboutMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
  readMore: { fontSize: 13, color: COLORS.primary, fontWeight: '700', marginTop: 4 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  photoItem: {
    width: '50%',
    padding: 6,
  },
  photoThumb: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  seeAllOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },

  ratingSummaryRow: { flexDirection: 'row', alignItems: 'center' },
  ratingSummaryText: { fontSize: 18, fontWeight: '700', color: '#000', marginLeft: 6 },

  chipRow: { flexDirection: 'row', paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  chipTextActive: { color: '#fff' },

  noReviews: { color: COLORS.subtext, fontSize: 13, textAlign: 'center', marginTop: 20 },
  reviewRow: { flexDirection: 'row', marginBottom: 20 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  reviewHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewerName: { fontSize: 16, fontWeight: '700', color: '#000' },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
  },
  reviewRatingText: { color: COLORS.primary, fontSize: 11, fontWeight: '700', marginLeft: 3 },
  reviewComment: { fontSize: 12.5, color: COLORS.subtext, marginTop: 4, lineHeight: 18 },
  reviewFooterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  reviewFooterText: { fontSize: 13.5, color: COLORS.subtext, marginLeft: 4 },
  reviewFooterDot: { fontSize: 13.5, color: COLORS.subtext, marginHorizontal: 6 },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  messageBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  bookBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImageWrap: {
    width: '100%',
    height: Dimensions.get('window').height * 0.68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '82%',
    marginTop: 28,
  },
  viewerNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: { color: '#fff', fontSize: 14, fontWeight: '600' },
});