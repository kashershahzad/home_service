import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#7310FF',
  lightPurple: '#F1E7FF',
  text: '#000000',
  track: '#E4E4E4',
};

const THUMB_SIZE = 22;
const THUMB_WRAP_WIDTH = 120;
const DEFAULT_CATEGORIES = ['All', 'Cleaning', 'Repairing', 'Painting', 'Laundry', 'Appliance'];
const RATINGS = ['All', '5', '4', '3', '2', '1'];
const SHEET_OFFSCREEN_Y = 500;
const CLOSE_DRAG_THRESHOLD = 100;

function RangeSlider({ min, max, step = 50, value, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [low, high] = value;

  const lowRef = useRef(low);
  const highRef = useRef(high);
  const trackWidthRef = useRef(trackWidth);
  const onChangeRef = useRef(onChange);
  const gestureStartValueRef = useRef({ low: 0, high: 0 });

  useEffect(() => { lowRef.current = low; }, [low]);
  useEffect(() => { highRef.current = high; }, [high]);
  useEffect(() => { trackWidthRef.current = trackWidth; }, [trackWidth]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const valueToX = (val, width) => {
    if (!width) return 0;
    return ((val - min) / (max - min)) * width;
  };

  const xToValue = (x, width) => {
    if (!width) return min;
    const raw = min + (x / width) * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.min(max, Math.max(min, stepped));
  };

  const makeResponder = (thumb) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        gestureStartValueRef.current[thumb] =
          thumb === 'low' ? lowRef.current : highRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const width = trackWidthRef.current;
        if (!width) return;

        const curLow = lowRef.current;
        const curHigh = highRef.current;
        const startVal = gestureStartValueRef.current[thumb];
        const newVal = xToValue(valueToX(startVal, width) + gesture.dx, width);

        if (thumb === 'low') {
          onChangeRef.current([Math.min(newVal, curHigh - step), curHigh]);
        } else {
          onChangeRef.current([curLow, Math.max(newVal, curLow + step)]);
        }
      },
    });

  const lowResponder = useRef(makeResponder('low')).current;
  const highResponder = useRef(makeResponder('high')).current;

  const lowX = valueToX(low, trackWidth);
  const highX = valueToX(high, trackWidth);

  const handleTrackPress = (e) => {
    const width = trackWidthRef.current;
    if (!width) return;
    const x = e.nativeEvent.locationX;
    const tappedVal = xToValue(x, width);

    const curLow = lowRef.current;
    const curHigh = highRef.current;
    const distToLow = Math.abs(tappedVal - curLow);
    const distToHigh = Math.abs(tappedVal - curHigh);

    if (distToLow <= distToHigh) {
      onChangeRef.current([Math.min(tappedVal, curHigh - step), curHigh]);
    } else {
      onChangeRef.current([curLow, Math.max(tappedVal, curLow + step)]);
    }
  };

  return (
    <View style={{ marginTop: 24, marginBottom: 4, paddingVertical: 16, paddingHorizontal: 18 }}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.sliderTrack}
        hitSlop={{ top: 24, bottom: 24, left: 8, right: 8 }}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        onPress={handleTrackPress}
      >
        <View
          style={[
            styles.sliderFill,
            { left: lowX, width: Math.max(0, highX - lowX) },
          ]}
        />

        <View
          style={[styles.thumbWrap, { left: lowX - THUMB_WRAP_WIDTH / 2 }]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          {...lowResponder.panHandlers}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{low}</Text>
          </View>
          <View style={styles.thumb} />
        </View>

        <View
          style={[styles.thumbWrap, { left: highX - THUMB_WRAP_WIDTH / 2 }]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          {...highResponder.panHandlers}
        >
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{high}</Text>
          </View>
          <View style={styles.thumb} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  categories = DEFAULT_CATEGORIES,
  priceMin = 0,
  priceMax = 5000,
  initialFilters,
}) {
  const [category, setCategory] = useState(initialFilters?.category || 'All');
  const [priceRange, setPriceRange] = useState(
    initialFilters?.priceRange || [priceMin, priceMax]
  );
  const [rating, setRating] = useState(initialFilters?.rating || 'All');
  
  const [sheetMounted, setSheetMounted] = useState(false);
  const isAnimating = useRef(false);

  const scrollOffsetY = useRef(0);
  const [innerScrollEnabled, setInnerScrollEnabled] = useState(true);

  const translateY = useRef(new Animated.Value(SHEET_OFFSCREEN_Y)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCategory(initialFilters?.category || 'All');
      setPriceRange(initialFilters?.priceRange || [priceMin, priceMax]);
      setRating(initialFilters?.rating || 'All');
      scrollOffsetY.current = 0;
      setInnerScrollEnabled(true);

      setSheetMounted(true);
      translateY.setValue(SHEET_OFFSCREEN_Y);
      backdropOpacity.setValue(0);
      isAnimating.current = true;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          mass: 0.9,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    }
  }, [visible]);

  const animateClose = useCallback(
    (after) => {
      if (isAnimating.current) return; 
      isAnimating.current = true;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SHEET_OFFSCREEN_Y,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSheetMounted(false);
        isAnimating.current = false;
        after?.();
      });
    },
    [translateY, backdropOpacity]
  );

  const handleClose = useCallback(() => {
    animateClose(onClose);
  }, [animateClose, onClose]);

  const handleReset = useCallback(() => {
    setCategory('All');
    setPriceRange([priceMin, priceMax]);
    setRating('All');
  }, [priceMin, priceMax]);

  const handleApply = useCallback(() => {
    animateClose(() => {
      onApply?.({ category, priceRange, rating });
      onClose?.();
    });
  }, [animateClose, onApply, onClose, category, priceRange, rating]);

  const dragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        scrollOffsetY.current <= 0 &&
        gesture.dy > 6 &&
        gesture.dy > Math.abs(gesture.dx),
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        scrollOffsetY.current <= 0 &&
        gesture.dy > 6 &&
        gesture.dy > Math.abs(gesture.dx),
      onPanResponderGrant: () => {
        setInnerScrollEnabled(false);
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        setInnerScrollEnabled(true);
        if (gesture.dy > CLOSE_DRAG_THRESHOLD) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 220,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setInnerScrollEnabled(true);
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  if (!sheetMounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>

      <Animated.View
        style={[styles.sheetWrap, { transform: [{ translateY }] }]}
        pointerEvents="box-none"
      >
        <View style={styles.sheet} {...dragResponder.panHandlers}>
          <View style={styles.dragArea}>
            <View style={styles.dragHandle} />
            <Text style={styles.title}>Filter</Text>
          </View>
          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            scrollEnabled={innerScrollEnabled}
            onScroll={(e) => {
              scrollOffsetY.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            {/* Category */}
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {categories.map((c) => {
                const active = c === category;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Price */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Price</Text>
            <RangeSlider
              min={priceMin}
              max={priceMax}
              step={50}
              value={priceRange}
              onChange={setPriceRange}
            />

            {/* Rating */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Rating</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {RATINGS.map((r) => {
                const active = r === rating;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRating(r)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    {r !== 'All' && (
                      <Ionicons
                        name="star"
                        size={13}
                        color={active ? '#fff' : COLORS.primary}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn} onPress={handleApply}>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    height: '58%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  dragArea: { alignItems: 'center', paddingBottom: 10 },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: { height: 1, backgroundColor: '#D8D8D8', marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

  chipRow: { flexDirection: 'row', paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12.5, fontWeight: '600', color: COLORS.primary },
  chipTextActive: { color: '#fff' },

  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.track,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  thumbWrap: {
    position: 'absolute',
    bottom: -9,
    width: THUMB_WRAP_WIDTH,
    alignItems: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  bubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  bubbleText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  resetBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  filterBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});