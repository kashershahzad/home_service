import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { images } from '../assets/images/image';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Converts JS's Sunday-first weekday index (0-6) to a Monday-first index (0-6)
function getFirstWeekdayMondayBased(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

export default function BookingDetailsScreen() {
    const router = useRouter();
    // If the Notifications screen sends a chosen promo back, it will arrive here as a param
    const params = useLocalSearchParams();

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(today.getDate());

    const [workingHours, setWorkingHours] = useState(0);
    const [selectedTime, setSelectedTime] = useState(null);
    const [promoCode, setPromoCode] = useState(
        params?.promoCode ? String(params.promoCode) : ''
    );

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstWeekday = getFirstWeekdayMondayBased(viewYear, viewMonth);

    const calendarCells = [];
    for (let i = 0; i < firstWeekday; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    const goPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const goNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const incrementHours = () => setWorkingHours((h) => h + 1);
    const decrementHours = () => setWorkingHours((h) => Math.max(0, h - 1));

    // Promo screen is actually the existing "Notifications" screen in this app,
    // so we navigate there instead of building a separate Add Promo screen.
    // On the Notifications screen, when the user taps a promo item, have it call:
    //   router.push({ pathname: '/booking-details', params: { promoCode: 'Discount 30% off' } })
    // so the chosen promo lands back here in `params.promoCode`.
    const openPromoScreen = () => {
        router.push({
            pathname: '/add-promo',
            params: { returnTo: 'booking-details' },
            id: String(params?.id ?? ''),
        });
    };

    const removePromo = () => setPromoCode('');

    const isFormValid = selectedDate && selectedTime;

    const handleContinue = () => {
        if (!isFormValid) return;
        router.push({
            pathname: '/address-location',
            params: {
                date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
                    selectedDate
                ).padStart(2, '0')}`,
                workingHours,
                startTime: selectedTime,
                promoCode,
            },
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity style={styles.backButton} onPress={
                            () => {
                                router.back();
                            }
                        }>
                            <Ionicons name="chevron-back" size={26} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Booking Details</Text>
                    </View>
                    <TouchableOpacity>
                        <Image source={images.moreIcon} style={styles.moreIcon} />
                    </TouchableOpacity>
                </View>

                {/* ---------- Calendar ---------- */}
                <Text style={styles.sectionLabel}>Select Date</Text>
                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeaderRow}>
                        <Text style={styles.calendarMonthText}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </Text>
                        <View style={styles.calendarNavRow}>
                            <TouchableOpacity onPress={goPrevMonth} style={styles.calendarNavButton}>
                                <Ionicons name="chevron-back" size={18} color="#7210FF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goNextMonth} style={styles.calendarNavButton}>
                                <Ionicons name="chevron-forward" size={18} color="#7210FF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.weekRow}>
                        {DAY_LABELS.map((d) => (
                            <Text key={d} style={styles.weekDayText}>
                                {d}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {calendarCells.map((day, idx) => {
                            if (day === null) {
                                return <View key={`empty-${idx}`} style={styles.dayCell} />;
                            }
                            const isSelected = day === selectedDate;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={styles.dayCell}
                                    onPress={() => setSelectedDate(day)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                                            {day}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ---------- Working Hours ---------- */}
                <View style={styles.workingHoursCard}>
                    <View style={styles.workingHoursRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.workingHoursTitle}>Working Hours</Text>
                            <Text style={styles.subLabel}>Cost increases after 2 hrs of work</Text>
                        </View>
                        <View style={styles.stepperRow}>
                            <TouchableOpacity style={styles.stepperButton} onPress={decrementHours}>
                                <Ionicons name="remove" size={18} color="#7310FF" />
                            </TouchableOpacity>
                            <Text style={styles.stepperValue}>{workingHours}</Text>
                            <TouchableOpacity style={styles.stepperButton} onPress={incrementHours}>
                                <Ionicons name="add" size={18} color="#7310FF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ---------- Start Time ---------- */}
                <Text style={styles.startTimeTitle}>Choose Start Time</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeSlotScroll}
                    contentContainerStyle={{ paddingRight: 8 }}
                >
                    {TIME_SLOTS.map((slot) => {
                        const isActive = slot === selectedTime;
                        return (
                            <TouchableOpacity
                                key={slot}
                                style={[styles.timePill, isActive && styles.timePillActive]}
                                onPress={() => setSelectedTime(slot)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.timePillText, isActive && styles.timePillTextActive]}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.sectionLabel}>Promo Code</Text>

                {promoCode ? (
                    <View style={styles.promoChipRow}>
                        <View style={styles.promoChip}>
                            <Text style={styles.promoChipText}>{promoCode}</Text>
                            <TouchableOpacity
                                onPress={removePromo}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close-outline" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.promoAddButton}
                            onPress={openPromoScreen}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={22} color="#7310FF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.promoRow}>
                        <TouchableOpacity
                            style={styles.promoInput}
                            onPress={openPromoScreen}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.promoPlaceholder}>Enter Promo Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.promoAddButton}
                            onPress={openPromoScreen}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={22} color="#7310FF" />
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 12 },
    moreIcon: { width: 24, height: 24, resizeMode: 'contain', },
    title: { fontSize: 22, fontWeight: '800', color: '#000000' },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 10 },
    subLabel: { fontSize: 12, color: '#9A9A9A', marginTop: 2 },

    // Slightly shorter overall: less internal padding and tighter row spacing
    // so the container hugs the last row of days instead of leaving extra
    // space at the bottom.
    calendarCard: {
        backgroundColor: '#F6F1FF',
        borderRadius: 16,
        paddingTop: 14,
        paddingHorizontal: 14,
        paddingBottom: 4,
        marginBottom: 24,
    },
    calendarHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    calendarMonthText: { fontSize: 15, fontWeight: '700', color: '#000' },
    calendarNavRow: { flexDirection: 'row' },
    calendarNavButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        // backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    weekRow: { flexDirection: 'row', marginBottom: 4 },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        color: '#9A9A9A',
        fontWeight: '600',
    },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1.35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
    dayCircle: {
        width: 28,
        height: 28,
        borderRadius: 140,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleSelected: { backgroundColor: '#7310FF', borderRadius: 140 },
    dayText: { fontSize: 13, color: '#000' },
    dayTextSelected: { color: '#fff', fontWeight: '700' },

    // Working Hours now lives inside its own white card with a soft shadow,
    // matching the "elevated card" look used elsewhere in the app.
    workingHoursCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.05)",
    },
    workingHoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workingHoursTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 4 },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperValue: { fontSize: 17, fontWeight: '700', color: '#000', marginHorizontal: 18 },

    startTimeTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 10 },
    timeSlotScroll: { marginBottom: 24 },
    timePill: {
        borderWidth: 1.5,
        borderColor: '#7310FF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    timePillActive: { backgroundColor: '#7310FF' },
    timePillText: { fontSize: 13, fontWeight: '600', color: '#7310FF' },
    timePillTextActive: { color: '#fff' },

    promoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 12,
    },
    promoInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    promoPlaceholder: {
        fontSize: 14,
        color: '#9A9A9A',
    },
    promoAddButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EDE4FF', // light purple
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoChipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        gap: 12,
    },
    promoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    promoChipText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
        marginRight: 10,
    },
    promoAddButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EDE4FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    footer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 36,
        // paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: "0px 0px 22px 0px rgba(0, 0, 0, 0.1)",

    },
    primaryButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonDisabled: { backgroundColor: '#C9A8FF' },
    primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});