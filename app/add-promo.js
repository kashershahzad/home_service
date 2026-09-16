import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
const PROMOS = [
    {
        id: '1',
        title: 'Payment Successful!',
        subtitle: 'Special promo only today!',
        label: 'Discount 10% off',
        color: '#7C5CFC',
        icon: 'credit-card',
        iconLib: 'feather',
    },
    {
        id: '2',
        title: 'New Category Services!',
        subtitle: 'New user special promo',
        label: 'Discount 30% off',
        color: '#F0AC1D',
        icon: 'ticket-percent-outline',
        iconLib: 'mci',
    },
    {
        id: '3',
        title: "Today's Special Offers",
        subtitle: 'Special promo only today!',
        label: 'Discount 15% off',
        color: '#F0577E',
        icon: 'ticket-percent-outline',
        iconLib: 'mci',
    },
    {
        id: '4',
        title: 'Credit Card Connected!',
        subtitle: 'Special promo only valid today',
        label: 'Discount 20% off',
        color: '#2FBE79',
        icon: 'credit-card',
        iconLib: 'feather',
    },
    {
        id: '5',
        title: 'Account Setup Successful!',
        subtitle: 'Special promo only today!',
        label: 'Discount 5% off',
        color: '#F0AC1D',
        icon: 'user',
        iconLib: 'feather',
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

function RadioCircle({ selected }) {
    return (
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
    );
}

function PromoCard({ item, selected, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <IconWithDots color={item.color} icon={item.icon} iconLib={item.iconLib} />
            <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <RadioCircle selected={selected} />
        </TouchableOpacity>
    );
}

export default function AddPromoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedId, setSelectedId] = useState(null);

    const selectedPromo = PROMOS.find((p) => p.id === selectedId);

    const handleContinue = () => {
        if (!selectedPromo) return;
        router.push({
            pathname: params?.returnTo ? `/${params.returnTo}` : '/booking-details',
            params: { promoCode: selectedPromo.label },
        });
    };

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
                            router.replace({
                                athname: '/booking-details',
                                params: {
                                    promoCode: selectedPromo.label,
                                    id: params?.id,
                                },
                            });
                        }
                    }}
                >
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Promo</Text>
                <TouchableOpacity style={styles.headerIconBtn} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
                    <Feather name="search" size={22} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {PROMOS.map((item) => (
                    <PromoCard
                        key={item.id}
                        item={item}
                        selected={item.id === selectedId}
                        onPress={() => setSelectedId(item.id)}
                    />
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedPromo && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedPromo}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: 60,
        paddingBottom: 18,
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
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 24,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.05)',

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
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#7310FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    radioOuterSelected: {
        backgroundColor: '#fff',
    },
    radioInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#7310FF',
    },
    footer: {
        paddingHorizontal: 18,
        paddingBottom: 20,
        paddingTop: 6,
    },
    continueButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#C9A8FF',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});