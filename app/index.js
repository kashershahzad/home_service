import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken, deleteToken, authApi } from '../utils/api';

const MIN_SPLASH_TIME = 2500;

export default function SplashScreen() {
    const router = useRouter();
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        const startTime = Date.now();

        const checkAuthAndNavigate = async () => {
            let destination = '/onboarding';

            try {
                const token = await getToken();

                if (token) {
                    try {
                        const data = await authApi.getMe(token);

                        if (data.user.profileCompleted && data.user.pinSet) {
                            destination = '/home';
                        } else if (!data.user.profileCompleted) {
                            destination = '/signup'; 
                        } else if (!data.user.pinSet) {
                            destination = '/create-pin';
                        }
                    } catch (err) {
                        await deleteToken();
                        destination = '/letYouIn';
                    }
                }
            } catch (err) {
                destination = '/onboarding';
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(MIN_SPLASH_TIME - elapsed, 0);

            setTimeout(() => {
                router.replace(destination);
            }, remaining);
        };

        checkAuthAndNavigate();
    }, []);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Animated.Image
                source={require('../assets/images/loader-dots.png')}
                style={[styles.dotsLoader, { transform: [{ rotate: spin }] }]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 220,
        height: 380,
        marginBottom: 40,
    },
    dotsLoader: {
        width: 55,
        height: 55,
        marginTop: 60,
    },
});