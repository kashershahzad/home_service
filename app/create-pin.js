import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Keyboard,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApi, getToken, saveToken } from '../utils/api';

const PIN_LENGTH = 4;
const REVEAL_DURATION = 500; 

export default function CreatePinScreen() {
    const router = useRouter();
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
            // backspace hua
            setRevealedIndex(-1);
        }

        setPin(cleaned);

        if (cleaned.length === PIN_LENGTH) {
            Keyboard.dismiss();
        }
    };

    const handleSignup = async () => {
        if (pin.length < PIN_LENGTH || isSubmitting) return;
        Keyboard.dismiss();

        setIsSubmitting(true);
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert('Session expired', 'Please sign up again.');
                router.replace('/signInNumber');
                return;
            }

            const data = await authApi.setPin(token, pin);
            await saveToken(data.token);

            router.push('/fingerprint');
        } catch (err) {
            Alert.alert('Could not set PIN', err.message);
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
                <Text style={styles.title}>Create New PIN</Text>
                <View style={styles.headerSpacer} />
            </View>
            <Text style={styles.subtitle}>
                Add a PIN number to make your account more secure.
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
                            {filled && (
                                showDigit ? (
                                    <Text style={styles.pinDigit}>{pin[index]}</Text>
                                ) : (
                                    <View style={styles.pinDot} />
                                )
                            )}
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
                onSubmitEditing={handleSignup}
                autoFocus
                style={styles.hiddenInput}
                caretHidden
            />

            <TouchableOpacity
                style={[
                    styles.primaryButton,
                    pin.length < PIN_LENGTH && styles.primaryButtonDisabled,
                ]}
                onPress={handleSignup}
                disabled={pin.length < PIN_LENGTH || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Signup</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        textAlign: 'left-aligned',
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