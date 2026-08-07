import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { serviceApi } from '../utils/api';
import { useBookmarks } from '../context/BookmarkContext';

const COLORS = {
    primary: '#7310FF',
    text: '#000000',
    subtext: '#6B6B6B',
    star: '#FFB800',
};

const HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 };

const FilterChips = React.memo(function FilterChips({ categories, activeFilter, onSelect }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
        >
            {categories.map((f) => {
                const active = f === activeFilter;
                return (
                    <TouchableOpacity
                        key={f}
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
            })}
        </ScrollView>
    );
});

export default function PopularServicesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState(['All']);
    const [activeFilter, setActiveFilter] = useState('All');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isBookmarked, toggleBookmark } = useBookmarks();

    useEffect(() => {
        let isMounted = true;
        const loadCategories = async () => {
            try {
                const res = await serviceApi.getCategories();
                if (isMounted) setCategories(['All', ...(res.categories || [])]);
            } catch (err) {
                console.log('Could not load categories:', err?.message || err);
            }
        };
        loadCategories();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadPopular = async () => {
            setLoading(true);
            try {
                const res = await serviceApi.getPopular(activeFilter);
                if (isMounted) setData(res.providers || []);
            } catch (err) {
                console.log('Could not load popular services:', err?.message || err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadPopular();
        return () => { isMounted = false; };
    }, [activeFilter]);

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity hitSlop={HIT_SLOP} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Most Popular Service</Text>
            </View>

            <FilterChips
                categories={categories}
                activeFilter={activeFilter}
                onSelect={setActiveFilter}
            />
            <FlatList
                style={styles.list}
                data={loading ? [] : data}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 6,
                    paddingBottom: 40,
                    flexGrow: 1,
                }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <Text style={styles.emptyText}>Couldn't find a popular service for this category.</Text>
                    )
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
                            onPress={() => toggleBookmark(item)}
                            hitSlop={HIT_SLOP}
                            style={styles.bookmarkButton}
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
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        flexShrink: 0,
    },
    title: {
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
        marginLeft: 14,
    },
    filterScroll: {
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 4,
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
        borderColor: '#7310FF',
        marginRight: 10,
        flexShrink: 0,
    },
    filterChipActive: {
        backgroundColor: '#7310FF',
        borderColor: '#7310FF',
    },
    filterChipText: { fontSize: 12.5, fontWeight: '600', color: '#7310FF' },
    filterChipTextActive: { color: '#fff' },
    list: {
        flex: 1,
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
    image: { width: 90, height: 90, borderRadius: 16, marginRight: 14 },
    name: { fontSize: 13, color: '#6B6B6B' },
    serviceTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 3 },
    price: { fontSize: 14.5, color: '#7310FF', fontWeight: '700', marginTop: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    ratingText: { fontSize: 11.5, color: '#6B6B6B', marginLeft: 4 },
});