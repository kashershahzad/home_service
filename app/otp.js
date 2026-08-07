import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OtpScreen() {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(58);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
        if (text && index === 3) {
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>OTP Code Verification</Text>
            <Text style={styles.subtitle}>
                We have sent an OTP code to your phone number +9234567890. Enter the code below to verify your account.
            </Text>

            <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpBox}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        returnKeyType="done"    
                        onSubmitEditing={Keyboard.dismiss} 
                    />
                ))}
            </View>

            <Text style={styles.resendText}>
                {timer > 0 ? `Resend code in ${timer} s` : 'Resend code'}
            </Text>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                    Keyboard.dismiss();
                    router.push('/home');
                }}
            >
                <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    backButton: {
        marginBottom: 30,
    },
    title: {
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 38,
        color: '#000000',
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 17,
        color: '#000',
        lineHeight: 20,
        marginBottom: 35,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    otpBox: {
        width: 74,
        height: 61,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
    },
    resendText: {
        textAlign: 'center',
        color: '#000',
        fontWeight: '400',
        fontSize: 17,
        marginBottom: 55,
    },
    primaryButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});