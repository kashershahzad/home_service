import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { images } from '../assets/images/image';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];

const STATUS_STYLES = {
    Upcoming: { bg: '#7310FF', text: '#fff' },
    Completed: { bg: '#2ECC71', text: '#fff' },
    Cancelled: { bg: '#FF3B30', text: '#fff' },
};

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekdayMondayBased(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function parseISODate(value) {
    if (!value || typeof value !== 'string') return null;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    return {
        year: Number(match[1]),
        month: Number(match[2]) - 1,
        day: Number(match[3]),
    };
}

export default function BookingDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const isViewMode = String(params?.mode || '') === 'view' || !!params?.status;
    const status = params?.status ? String(params.status) : '';
    const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Upcoming;

    const initialDate = useMemo(() => {
        return parseISODate(params?.date ? String(params.date) : '') || {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            day: new Date().getDate(),
        };
    }, [params?.date]);

    const [viewYear, setViewYear] = useState(initialDate.year);
    const [viewMonth, setViewMonth] = useState(initialDate.month);
    const [selectedDate, setSelectedDate] = useState(initialDate.day);
    const [workingHours, setWorkingHours] = useState(
        params?.workingHours ? Number(params.workingHours) || 0 : 0
    );
    const [selectedTime, setSelectedTime] = useState(
        params?.startTime ? String(params.startTime) : null
    );
    const [promoCode, setPromoCode] = useState(
        params?.promoCode ? String(params.promoCode) : ''
    );

    const dateLabel =
        params?.dateLabel
            ? String(params.dateLabel)
            : `${MONTH_NAMES[viewMonth]} ${selectedDate}, ${viewYear}`;

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstWeekday = getFirstWeekdayMondayBased(viewYear, viewMonth);

    const calendarCells = [];
    for (let i = 0; i < firstWeekday; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    const goPrevMonth = () => {
        if (isViewMode) return;
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const goNextMonth = () => {
        if (isViewMode) return;
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const incrementHours = () => {
        if (isViewMode) return;
        setWorkingHours((h) => h + 1);
    };
    const decrementHours = () => {
        if (isViewMode) return;
        setWorkingHours((h) => Math.max(0, h - 1));
    };

    const openPromoScreen = () => {
        if (isViewMode) return;
        router.push({
            pathname: '/add-promo',
            params: { returnTo: 'booking-details', id: String(params?.id ?? '') },
        });
    };

    const removePromo = () => {
        if (isViewMode) return;
        setPromoCode('');
    };

    const isFormValid = selectedDate && selectedTime;

    const handleContinue = () => {
        if (isViewMode || !isFormValid) return;
        router.push({
            pathname: '/address-location',
            params: {
                ...params,
                date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(
                    selectedDate
                ).padStart(2, '0')}`,
                workingHours: String(workingHours),
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
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back" size={26} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Booking Details</Text>
                    </View>
                    <TouchableOpacity>
                        <Image source={images.moreIcon} style={styles.moreIcon} />
                    </TouchableOpacity>
                </View>

                {isViewMode ? (
                    <>
                        {(params?.title || params?.name) && (
                            <View style={styles.serviceCard}>
                                {params?.image ? (
                                    <Image
                                        source={{ uri: String(params.image) }}
                                        style={styles.serviceImage}
                                    />
                                ) : null}
                                <View style={{ flex: 1 }}>
                                    {!!params?.title && (
                                        <Text style={styles.serviceTitle}>{String(params.title)}</Text>
                                    )}
                                    {!!params?.name && (
                                        <Text style={styles.serviceName}>{String(params.name)}</Text>
                                    )}
                                    {!!params?.price && (
                                        <Text style={styles.servicePrice}>Rs.{String(params.price)}</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        <View style={styles.detailCard}>
                            <DetailRow icon="calendar-outline" label="Date" value={dateLabel} />
                            <DetailRow icon="time-outline" label="Time" value={selectedTime || '—'} />
                            <DetailRow
                                icon="hourglass-outline"
                                label="Working Hours"
                                value={`${workingHours} hrs`}
                            />
                        </View>

                        {!!promoCode && (
                            <View style={styles.promoOnlyWrap}>
                                <Text style={styles.filledLabel}>Promo Code</Text>
                                <View style={styles.promoChip}>
                                    <Text style={styles.promoChipText}>{promoCode}</Text>
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {isViewMode ? (
                    <View style={[styles.primaryButton, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.primaryButtonText, { color: statusStyle.text }]}>
                            {status}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
                        onPress={handleContinue}
                        disabled={!isFormValid}
                    >
                        <Text style={styles.primaryButtonText}>Continue</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
                <Ionicons name={icon} size={18} color="#7310FF" />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 12 },
    moreIcon: { width: 24, height: 24, resizeMode: 'contain' },
    title: { fontSize: 22, fontWeight: '800', color: '#000000' },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 10 },
    filledLabel: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 10 },
    subLabel: { fontSize: 12, color: '#9A9A9A', marginTop: 2 },

    serviceCard: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 12,
        marginBottom: 18,
        gap: 12,
    },
    serviceImage: { width: 72, height: 72, borderRadius: 12 },
    serviceTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
    serviceName: { fontSize: 13, color: '#6B6B6B', marginTop: 3 },
    servicePrice: { fontSize: 14, fontWeight: '700', color: '#7310FF', marginTop: 6 },

    detailCard: {
        backgroundColor: '#F6F1FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
        gap: 14,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailLabel: { fontSize: 14, color: '#6B6B6B', fontWeight: '600' },
    detailValue: { fontSize: 14, fontWeight: '700', color: '#000' },

    promoOnlyWrap: { marginBottom: 20 },

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

    workingHoursCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.05)',
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
        alignSelf: 'flex-start',
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
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0px 0px 22px 0px rgba(0, 0, 0, 0.1)',
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
