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
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../store/reducer/AuthConfig';
import { setUserData } from '../store/reducer/usersSlice';
import { authApi, getToken, saveToken } from '../utils/api';
import { saveBiometricCredentials, savePinForBiometric } from '../utils/biometric';

const PIN_LENGTH = 4;
const REVEAL_DURATION = 500;

export default function CreatePinScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { mode } = useLocalSearchParams();
    const isUpdate = mode === 'update';
    const user = useSelector((state) => state.users.userData);

    const [pin, setPin] = useState('');
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);
    const revealTimeout = useRef(null);

    useEffect(() => {
        return () => {
            if (revealTimeout.current) clearTimeout(revealTimeout.current);
        };
    }, []);

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

    const handleSubmit = async () => {
        if (pin.length < PIN_LENGTH || isSubmitting) return;
        Keyboard.dismiss();

        setIsSubmitting(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Session expired', 'Please sign in again.');
                router.replace('/signInNumber');
                return;
            }

            const data = await authApi.setPin(token, pin);
            await saveToken(data.token);
            dispatch(setToken(data.token));

            // Needed so biometric login can call /auth/login with this PIN
            await savePinForBiometric(pin);
            if (user?.phone) {
                await saveBiometricCredentials(user.phone, pin);
            }

            try {
                const profile = await authApi.getMe(data.token);
                const nextUser = profile?.user || profile;
                if (nextUser) dispatch(setUserData(nextUser));
            } catch (_) {}

            if (isUpdate) {
                Alert.alert('PIN updated', 'Your PIN has been changed.', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (router.canGoBack()) router.back();
                            else router.replace('/profile');
                        },
                    },
                ]);
                return;
            }

            router.push('/fingerprint');
        } catch (err) {
            Alert.alert(
                isUpdate ? 'Could not update PIN' : 'Could not set PIN',
                err.message,
            );
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
                <Text style={styles.title}>
                    {isUpdate ? 'Update PIN' : 'Create New PIN'}
                </Text>
                <View style={styles.headerSpacer} />
            </View>
            <Text style={styles.subtitle}>
                {isUpdate
                    ? 'Enter a new 4-digit PIN for your account.'
                    : 'Add a PIN number to make your account more secure.'}
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
                onSubmitEditing={handleSubmit}
                autoFocus
                style={styles.hiddenInput}
                caretHidden
            />

            <TouchableOpacity
                style={[
                    styles.primaryButton,
                    pin.length < PIN_LENGTH && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={pin.length < PIN_LENGTH || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>
                        {isUpdate ? 'Update PIN' : 'Continue'}
                    </Text>
                )}
            </TouchableOpacity>
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
        lineHeight: 20,
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
});
