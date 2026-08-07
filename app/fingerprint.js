import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Image,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const PURPLE = '#7310FF';
const PURPLE_LIGHT = '#EDE9FE';
const TEXT_GRAY = '#6B7280';
const DECOR_DOTS = [
    { top: -14, left: 22, size: 12, opacity: 0.9 },
    { top: 8, left: 0, size: 8, opacity: 0.6 },
    { top: -24, left: 74, size: 9, opacity: 0.7 },
    { top: -8, left: 122, size: 14, opacity: 0.9 },
    { top: 18, left: 160, size: 8, opacity: 0.6 },
    { top: -20, left: 188, size: 10, opacity: 0.8 },
    { top: 58, left: -10, size: 7, opacity: 0.5 },
    { top: 72, left: 200, size: 7, opacity: 0.5 },
    { top: 100, left: -4, size: 5, opacity: 0.4 },
    { top: 104, left: 202, size: 5, opacity: 0.4 },
];

export default function SetFingerprintScreen() {
    const router = useRouter();
    const [showSuccess, setShowSuccess] = useState(false);
    const [scanning, setScanning] = useState(false);
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let loop;
        if (showSuccess) {
            spinValue.setValue(0);
            loop = Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            loop.start();
        }
        return () => {
            if (loop) loop.stop();
        };
    }, [showSuccess]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleContinue = async () => {
        // ===== REAL FINGERPRINT/FACE ID SCAN (commented out for now — needs a Dev Build, not Expo Go) =====
        // try {
        //     setScanning(true);
        //
        //     // Check if device has fingerprint hardware
        //     const hasHardware = await LocalAuthentication.hasHardwareAsync();
        //     if (!hasHardware) {
        //         setScanning(false);
        //         Alert.alert('Not Supported', 'This device does not have a fingerprint scanner.');
        //         return;
        //     }
        //
        //     // Check if a fingerprint is enrolled on the device
        //     const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        //     if (!isEnrolled) {
        //         setScanning(false);
        //         Alert.alert(
        //             'No Fingerprint Found',
        //             'Please set up a fingerprint in your phone settings first.'
        //         );
        //         return;
        //     }
        //
        //     // Trigger the actual scan (Face ID or Fingerprint depending on device)
        //     const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        //     const isFaceId = types.includes(
        //         LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        //     );
        //
        //     const result = await LocalAuthentication.authenticateAsync({
        //         promptMessage: isFaceId ? 'Scan your face' : 'Scan your fingerprint',
        //         cancelLabel: 'Cancel',
        //         disableDeviceFallback: true,
        //     });
        //
        //     setScanning(false);
        //
        //     if (result.success) {
        //         // TODO: confirm here that the fingerprint is linked to the account (backend)
        //         setShowSuccess(true);
        //         setTimeout(() => {
        //             setShowSuccess(false);
        //             router.replace('/home');
        //         }, 2000);
        //     } else if (result.error !== 'user_cancel') {
        //         console.log('Biometric auth failed:', result.error);
        //         Alert.alert(
        //             'Failed',
        //             `${isFaceId ? 'Face ID' : 'Fingerprint'} did not match, please try again.\n\n(debug: ${result.error})`
        //         );
        //     }
        // } catch (error) {
        //     setScanning(false);
        //     Alert.alert('Error', 'Something went wrong, please try again.');
        // }
        // ===== END REAL SCAN =====

        // TEMP: simulate success so the flow can be tested in Expo Go without a Dev Build
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            router.replace('/home');
        }, 2000);
    };

    const handleSkip = () => {
        router.replace('/home');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Set Your Fingerprint</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.subtitle}>
                Add a fingerprint to make your account more secure
            </Text>

            <View style={styles.fingerprintWrap}>
                <Image
                    source={require('../assets/images/fingerprint.png')}
                    style={styles.fingerprintImage}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.helperText}>
                Please put your finger on the fingerprint{'\n'}scanner to get started.
            </Text>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.continueButton, scanning && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={scanning}
                >
                    {scanning ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.continueText}>continue</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.decorWrap}>
                            {DECOR_DOTS.map((dot, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.decorDot,
                                        {
                                            top: dot.top,
                                            left: dot.left,
                                            width: dot.size,
                                            height: dot.size,
                                            borderRadius: dot.size / 2,
                                            opacity: dot.opacity,
                                        },
                                    ]}
                                />
                            ))}
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="person" size={50} color="#fff" />
                            </View>
                        </View>

                        <Text style={styles.congratsTitle}>Congratulations!</Text>
                        <Text style={styles.congratsText}>
                            Your account is ready to use. You will be redirected to the Home
                            page in a few seconds.
                        </Text>

                        <Animated.Image
                            source={require('../assets/images/loader-dots.png')}
                            style={[styles.loaderDots, { transform: [{ rotate: spin }] }]}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </Modal>
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
        marginBottom: 90,
    },
    backButton: {
        width: 26,
    },
    headerSpacer: {
        width: 26,
    },
    title: {
        flex: 1,
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 24,
        fontWeight: '800',
        color: '#000000',
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: '#000',
        marginBottom: -10,
    },
    fingerprintWrap: {
        alignItems: 'center',
        marginBottom: 0,
    },
    fingerprintImage: {
        width: 400,
        height: 400,
    },
    helperText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
        marginBottom: 60,
    },
    skipButton: {
        flex: 1,
        backgroundColor: '#ECECEC',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipText: {
        color: PURPLE,
        fontWeight: '600',
        fontSize: 15,
    },
    continueButton: {
        flex: 1,
        backgroundColor: PURPLE,
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#B48CFF',
    },
    continueText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 420,
    },
    decorWrap: {
        width: 200,
        height: 130,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    decorDot: {
        position: 'absolute',
        backgroundColor: PURPLE,
    },
    modalIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    congratsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: PURPLE,
        marginBottom: 12,
    },
    congratsText: {
        fontSize: 15,
        color: '#000',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    loaderDots: {
        width: 34,
        height: 34,
        marginTop: 26,
    },
});