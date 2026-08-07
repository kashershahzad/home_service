import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Booking Details</Text>
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
                                <Ionicons name="chevron-back" size={18} color="#7310FF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goNextMonth} style={styles.calendarNavButton}>
                                <Ionicons name="chevron-forward" size={18} color="#7310FF" />
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

                {/* ---------- Promo Code ---------- */}
                <Text style={styles.sectionLabel}>Promo Code</Text>
                {promoCode ? (
                    <View style={styles.promoChipRow}>
                        <View style={styles.promoChip}>
                            <Text style={styles.promoChipText}>{promoCode}</Text>
                            <TouchableOpacity
                                onPress={removePromo}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.promoRow} onPress={openPromoScreen} activeOpacity={0.8}>
                        <Text style={styles.promoPlaceholder}>Enter Promo Code</Text>
                        <View style={styles.promoAddButton}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 12 },
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
        backgroundColor: '#fff',
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
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleSelected: { backgroundColor: '#7310FF' },
    dayText: { fontSize: 13, color: '#000' },
    dayTextSelected: { color: '#fff', fontWeight: '700' },

    // Working Hours now lives inside its own white card with a soft shadow,
    // matching the "elevated card" look used elsewhere in the app.
    workingHoursCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
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
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderRadius: 30,
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginBottom: 30,
    },
    promoPlaceholder: { fontSize: 14, color: '#9A9A9A' },
    promoAddButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#7310FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoChipRow: { marginBottom: 30 },
    promoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#7310FF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    promoChipText: { color: '#fff', fontWeight: '600', fontSize: 16, marginRight: 10 },

    primaryButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonDisabled: { backgroundColor: '#C9A8FF' },
    primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});