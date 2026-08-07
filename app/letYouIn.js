import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
const GoogleIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 48 48">
        <Path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
      c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
      c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <Path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
      l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <Path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
      c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <Path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
      c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
      C44,22.659,43.862,21.35,43.611,20.083z"
        />
    </Svg>
);

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>

            <View style={styles.illustrationWrapper}>
                <Image
                    source={require('../assets/images/login-illustration.png')}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            <Text style={styles.title}>Let’s you in</Text>

            <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
                <GoogleIcon />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#000" />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or</Text>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/signInNumber')}
            >
                <Text style={styles.primaryButtonText}>Sign in with Number</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 20,
    },
    illustrationWrapper: {
        alignItems: 'center',
        marginBottom: 8,
        marginTop: -30,
    },
    illustration: {
        width: 300,
        height: 250,
    },
    title: {
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 35,
        textAlign: 'center',
        color: '#000000',
        marginBottom: 30,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F4F4',
        borderRadius: 10,
        paddingVertical: 14,
        marginBottom: 14,
    },
    socialButtonText: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    orText: {
        textAlign: 'center',
        color: '#000',
        marginVertical: 10,
        marginTop: 15,
        fontSize: 15, 
    },
    primaryButton: {
        backgroundColor: '#7310FF',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 15,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#000',
    },
    footerLink: {
        color: '#7310FF',
        fontWeight: '600',
    },
});