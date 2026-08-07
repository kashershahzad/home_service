import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serviceApi } from '../utils/api';
import { useBookmarks } from '../context/BookmarkContext';
import FilterModal from '../constants/FilterModal'; 

const COLORS = {
    primary: '#7310FF',
    text: '#000000',
    subtext: '#6B6B6B',
    star: '#FFB800',
    border: '#E4E4E4',
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };
const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT = 10;
const PRICE_MIN = 0;
const PRICE_MAX = 5000;

const isFilterActive = (f) => {
    if (!f) return false;
    const categoryActive = f.category && f.category !== 'All';
    const ratingActive = f.rating && f.rating !== 'All';
    const priceActive =
        f.priceRange && (f.priceRange[0] !== PRICE_MIN || f.priceRange[1] !== PRICE_MAX);
    return categoryActive || ratingActive || priceActive;
};

export default function SearchScreen() {
    const router = useRouter();
    const { openFilter } = useLocalSearchParams();
    const { isBookmarked, toggleBookmark } = useBookmarks();

    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [recentLoaded, setRecentLoaded] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef(null);
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const [filterVisible, setFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [categories, setCategories] = useState(['All']);
    useEffect(() => {
        if (openFilter === '1') {
            setFilterVisible(true);
        }
    }, [openFilter]);
    useEffect(() => {
        let isMounted = true;
        const loadCategories = async () => {
            try {
                const data = await serviceApi.getCategories();
                if (isMounted) setCategories(['All', ...(data.categories || [])]);
            } catch (err) {
                console.log('Could not load categories:', err?.message || err);
            }
        };
        loadCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadRecent = async () => {
            try {
                const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
                if (!isMounted) return;
                if (stored) {
                    setRecentSearches(JSON.parse(stored));
                } else {
                    setRecentSearches([]);
                }
            } catch (err) {
                console.log('Could not load recent searches:', err?.message || err);
                if (isMounted) setRecentSearches([]);
            } finally {
                if (isMounted) setRecentLoaded(true);
            }
        };
        loadRecent();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!recentLoaded) return;
        AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches)).catch(
            (err) => console.log('Could not save recent searches:', err?.message || err)
        );
    }, [recentSearches, recentLoaded]);

    const runSearch = useCallback(async (term, filters) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const data = await serviceApi.search(term, filters || {});
            setResults(data.providers || []);
        } catch (err) {
            console.log('Search failed:', err?.message || err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = query.trim();
        const filtersActive = isFilterActive(activeFilters);

        if (!trimmed && !filtersActive) {
            setHasSearched(false);
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            runSearch(trimmed, activeFilters);
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [query, activeFilters, runSearch]);

    const onSubmitSearch = () => {
        const trimmed = query.trim();
        if (!trimmed) return;
        if (!recentSearches.includes(trimmed)) {
            setRecentSearches((prev) => [trimmed, ...prev].slice(0, MAX_RECENT));
        }
        runSearch(trimmed, activeFilters);
    };

    const removeRecent = (term) => {
        setRecentSearches((prev) => prev.filter((r) => r !== term));
    };

    const clearAllRecent = () => setRecentSearches([]);

    const onTapRecent = (term) => {
        setQuery(term);
        runSearch(term, activeFilters);
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
    };

    const filtersActive = isFilterActive(activeFilters);
    const showRecent = query.trim().length === 0 && !filtersActive;

    return (
        <View style={styles.screen}>
            <View style={styles.searchRow}>
                <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
                    <Feather name="search" size={18} color={COLORS.subtext} />
                    <TextInput
                        ref={inputRef}
                        placeholder="Search"
                        placeholderTextColor={COLORS.subtext}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={onSubmitSearch}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        returnKeyType="search"
                        style={styles.searchInput}
                    />
                    <TouchableOpacity
                        hitSlop={HIT_SLOP}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Feather
                            name="sliders"
                            size={18}
                            color={filtersActive ? COLORS.primary : COLORS.subtext}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {showRecent ? (
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.recentTitle}>Recent</Text>
                        {recentSearches.length > 0 && (
                            <TouchableOpacity hitSlop={HIT_SLOP} onPress={clearAllRecent}>
                                <Text style={styles.clearAll}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={recentSearches}
                        keyExtractor={(item) => item}
                        ItemSeparatorComponent={() => <View style={styles.recentDivider} />}
                        ListEmptyComponent={
                            <Text style={styles.emptyRecentText}>No recent searches</Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.recentRow}
                                onPress={() => onTapRecent(item)}
                            >
                                <Text style={styles.recentItemText}>{item}</Text>
                                <TouchableOpacity hitSlop={HIT_SLOP} onPress={() => removeRecent(item)}>
                                    <Ionicons name="close-circle" size={18} color="#C7C7C7" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.resultsHeaderRow}>
                        <Text style={styles.resultsFor}>
                            {query.trim() ? (
                                <>Results for "<Text style={styles.resultsQuery}>{query.trim()}</Text>"</>
                            ) : (
                                <Text style={styles.resultsQuery}>Filtered Results</Text>
                            )}
                        </Text>
                        {!loading && (
                            <Text style={styles.resultsCount}>
                                {hasSearched ? `${results.length.toLocaleString()} found` : ''}
                            </Text>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 30 }} />
                    ) : results.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Image
                                source={require('../assets/images/not-found.png')}
                                style={styles.emptyStateImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.emptyStateTitle}>Not Found</Text>
                            <Text style={styles.emptyStateText}>
                                Sorry, the keyword you entered cannot be found, please check again or
                                search with another keyword.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40 }}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.85}
                                    onPress={() => router.push(`/service/${item._id}`)}
                                >
                                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardName}>{item.name}</Text>
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                        <Text style={styles.cardPrice}>Rs.{item.price}</Text>
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={13} color={COLORS.star} />
                                            <Text style={styles.ratingText}>
                                                {item.rating} | {item.reviewsCount} reviews
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.bookmarkBtn}
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
            )}

            <FilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={handleApplyFilters}
                categories={categories}
                priceMin={PRICE_MIN}
                priceMax={PRICE_MAX}
                initialFilters={activeFilters}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FAFAFA' },
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DADADA4D',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    searchBarFocused: {backgroundColor: '#F1E7FF',borderColor: COLORS.primary,},
    searchInput: { flex: 1, fontSize: 14.5, color: COLORS.text, marginLeft: 8 },
    recentHeader: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginBottom: 10, },
    recentTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    clearAll: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    recentDivider: { height: 1, backgroundColor: '#EFEFEF' },
    recentRow: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',paddingVertical: 14, },
    recentItemText: { fontSize: 14, color: '#9A9A9A' },
    emptyRecentText: { textAlign: 'center', color: COLORS.subtext, marginTop: 30 },
    resultsHeaderRow: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',paddingHorizontal: 20,marginTop: 10,marginBottom: 14,},
    resultsFor: { fontSize: 14, color: COLORS.text, flexShrink: 1, paddingRight: 10 },
    resultsQuery: { fontWeight: '800', color: COLORS.text },
    resultsCount: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
    emptyState: {    flex: 1,  alignItems: 'center',  justifyContent: 'center',  paddingHorizontal: 40,  marginTop: -100, },
    emptyStateImage: { width: 300, height: 300 },
    emptyStateTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 10 },
    emptyStateText: { textAlign: 'center', color: COLORS.subtext, fontSize: 13.5, marginTop: 8, lineHeight: 20,},
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
    cardImage: { width: 90, height: 90, borderRadius: 16, marginRight: 14 },
    cardName: { fontSize: 13, color: COLORS.subtext },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 3 },
    cardPrice: { fontSize: 14.5, color: COLORS.primary, fontWeight: '700', marginTop: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    ratingText: { fontSize: 11.5, color: COLORS.subtext, marginLeft: 4 },
    bookmarkBtn: { padding: 4, alignSelf: 'flex-start' },
});