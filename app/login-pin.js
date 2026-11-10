import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useBookmarks } from '../context/BookmarkContext';
import { setToken } from '../store/reducer/AuthConfig';
import { setUserData } from '../store/reducer/usersSlice';
import { authApi, saveToken } from '../utils/api';
import {
    authenticateWithBiometric,
    biometricErrorMessage,
    getBiometricCapability,
    getBiometricCredentials,
    saveBiometricCredentials,
} from '../utils/biometric';
import { registerFcmTokenWithBackend } from '../utils/fcm';
import { legacyBuggyPkPhone, normalizePhone } from '../utils/phone';

const PIN_LENGTH = 4;
const REVEAL_DURATION = 500;

export default function LoginPinScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { refreshForUser } = useBookmarks();
    const { phone } = useLocalSearchParams();
    const phoneNumber = typeof phone === 'string' ? phone : Array.isArray(phone) ? phone[0] : '';

    const [pin, setPin] = useState('');
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [biometricLabel, setBiometricLabel] = useState(null);
    const [canUseBiometric, setCanUseBiometric] = useState(false);
    const inputRef = useRef(null);
    const revealTimeout = useRef(null);

    useEffect(() => {
        if (!phoneNumber) {
            Alert.alert('Missing phone', 'Please enter your phone number again.');
            router.replace('/signInNumber');
        }
    }, [phoneNumber, router]);

    useEffect(() => {
        return () => {
            if (revealTimeout.current) clearTimeout(revealTimeout.current);
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const cap = await getBiometricCapability();
            const creds = await getBiometricCredentials();
            const normalized = normalizePhone(phoneNumber);
            const savedPhone = normalizePhone(creds.phone || '');
            const phoneMatches =
                !!creds.pin &&
                !!savedPhone &&
                (savedPhone === normalized ||
                    savedPhone === legacyBuggyPkPhone(normalized) ||
                    legacyBuggyPkPhone(savedPhone) === normalized);

            if (!mounted) return;
            setBiometricLabel(cap.label);
            setCanUseBiometric(cap.available && cap.enrolled && phoneMatches);
        })();
        return () => {
            mounted = false;
        };
    }, [phoneNumber]);

    const handleChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);

        if (revealTimeout.current) {
            clearTimeout(revealTimeout.current);
            revealTimeout.current = null;
        }

        if (cleaned.length > pin.length) {
            const newIndex = cleaned.length - 1;
            setRevealedIndex(newIndex);
            revealTimeout.current = setTimeout(() => {
                setRevealedIndex(-1);
            }, REVEAL_DURATION);
        } else {
            setRevealedIndex(-1);
        }

        setPin(cleaned);

        if (cleaned.length === PIN_LENGTH) {
            Keyboard.dismiss();
        }
    };

    const completeLogin = async (loginPhone, loginPin) => {
        const normalized = normalizePhone(loginPhone);
        let data;
        try {
            data = await authApi.login(normalized, loginPin);
        } catch (err) {
            const legacy = legacyBuggyPkPhone(normalized);
            if (!legacy || !/no account found/i.test(err?.message || '')) {
                throw err;
            }
            data = await authApi.login(legacy, loginPin);
        }

        await saveToken(data.token);
        dispatch(setToken(data.token));

        const user = data.user || null;
        if (user) {
            dispatch(setUserData(user));
            if (user.biometricEnabled) {
                await saveBiometricCredentials(user.phone || normalized, loginPin);
            }
        } else {
            try {
                const profile = await authApi.getMe(data.token);
                const nextUser = profile?.user || profile;
                if (nextUser) {
                    dispatch(setUserData(nextUser));
                    if (nextUser.biometricEnabled) {
                        await saveBiometricCredentials(
                            nextUser.phone || normalized,
                            loginPin,
                        );
                    }
                }
            } catch (_) {}
        }

        await refreshForUser();

        // Postman 12 — send FCM token after login (non-blocking)
        registerFcmTokenWithBackend(data.token);

        router.replace('/home');
    };

    const handleLogin = async () => {
        if (pin.length < PIN_LENGTH || isSubmitting || !phoneNumber) return;
        Keyboard.dismiss();

        setIsSubmitting(true);
        try {
            await completeLogin(phoneNumber, pin);
        } catch (err) {
            Alert.alert('Login failed', err.message);
            setPin('');
            setRevealedIndex(-1);
            inputRef.current?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (isSubmitting || !canUseBiometric) return;
        setIsSubmitting(true);
        try {
            const result = await authenticateWithBiometric(
                `Sign in with ${biometricLabel || 'biometric'}`,
            );
            if (!result.success) {
                const msg = biometricErrorMessage(result);
                if (msg) Alert.alert('Biometric failed', msg);
                return;
            }

            const creds = await getBiometricCredentials();
            if (!creds.pin) {
                Alert.alert(
                    'PIN required',
                    'Please sign in with your PIN once to enable biometric login.',
                );
                return;
            }

            await completeLogin(phoneNumber || creds.phone, creds.pin);
        } catch (err) {
            Alert.alert('Login failed', err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Enter PIN</Text>
                <View style={styles.headerSpacer} />
            </View>
            <Text style={styles.subtitle}>
                Enter your 4-digit PIN to sign in{phoneNumber ? `\n${phoneNumber}` : ''}.
            </Text>

            <TouchableOpacity
                activeOpacity={1}
                style={styles.pinRow}
                onPress={() => inputRef.current?.focus()}
            >
                {Array.from({ length: PIN_LENGTH }).map((_, index) => {
                    const filled = pin.length > index;
                    const showDigit = filled && index === revealedIndex;
                    return (
                        <View key={index} style={styles.pinBox}>
                            {filled &&
                                (showDigit ? (
                                    <Text style={styles.pinDigit}>{pin[index]}</Text>
                                ) : (
                                    <View style={styles.pinDot} />
                                ))}
                        </View>
                    );
                })}
            </TouchableOpacity>
            <TextInput
                ref={inputRef}
                value={pin}
                onChangeText={handleChange}
                keyboardType="number-pad"
                maxLength={PIN_LENGTH}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                autoFocus={!canUseBiometric}
                style={styles.hiddenInput}
                caretHidden
            />

            <TouchableOpacity
                style={[
                    styles.primaryButton,
                    pin.length < PIN_LENGTH && styles.primaryButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={pin.length < PIN_LENGTH || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            {canUseBiometric ? (
                <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                    disabled={isSubmitting}
                >
                    <Ionicons
                        name={
                            biometricLabel === 'Face ID'
                                ? 'scan-outline'
                                : 'finger-print-outline'
                        }
                        size={22}
                        color="#7310FF"
                    />
                    <Text style={styles.biometricText}>
                        Sign in with {biometricLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6FAF8',
        paddingHorizontal: 24,
        paddingTop: 70,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 60,
    },
    backButton: {
        width: 26,
    },
    headerSpacer: {
        width: 26,
    },
    title: {
        flex: 1,
        textAlign: 'left',
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 24,
        fontWeight: '800',
        color: '#000000',
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'center',
        color: '#000',
        lineHeight: 22,
        marginBottom: 50,
        marginTop: 50,
    },
    pinRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    pinBox: {
        width: 74,
        height: 61,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#000',
    },
    pinDigit: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 0,
        width: 0,
    },
    primaryButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 40,
    },
    primaryButtonDisabled: {
        backgroundColor: '#C9A8FF',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    biometricButton: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    biometricText: {
        color: '#7310FF',
        fontWeight: '600',
        fontSize: 15,
    },
});
