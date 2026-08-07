import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
    {
        key: '1',
        title: 'We provide professional service at a friendly price',
        image: require('../assets/images/onboarding/onboarding1.png'),
    },
    {
        key: '2',
        title: 'The best results and your satisfaction is our top priority',
        image: require('../assets/images/onboarding/onboarding2.png'),
    },
    {
        key: '3',
        title: 'Let’s make awesome changes to your home',
        image: require('../assets/images/onboarding/onboarding3.png'),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const sliderRef = React.useRef(null);

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.imageArea}>
                <View style={styles.circleBg} />
                <View style={[styles.dot, styles.dotTopLeft]} />
                <View style={[styles.dot, styles.dotTopRight]} />
                <View style={[styles.dotMedium, styles.dotBottomLeft]} />
                <View style={[styles.dotMedium, styles.dotMediumTopRight]} />
                <View style={[styles.dotTiny, styles.dotMediumRight]} />
                <View style={[styles.dotSmall, styles.dotTinyLeft1]} />
                <View style={[styles.dotTiny, styles.dotTinyLeft2]} />
                <View style={[styles.dotSmall, styles.dotSmallTopRight]} />
                <View style={[styles.dotSmall, styles.dotSmallBottom]} />
                <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
        </View>
    );

    const onDone = () => {
        router.replace('/letYouIn');
    };

    const renderPagination = (activeIdx) => (
        <View style={styles.paginationRoot} pointerEvents="box-none">
            <View style={styles.paginationWrapper}>
                <View style={styles.paginationDots}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.paginationDot,
                                i === activeIdx && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (activeIdx === slides.length - 1) {
                            onDone();
                        } else {
                            sliderRef.current?.goToSlide(activeIdx + 1, true);
                        }
                    }}
                >
                    <Text style={styles.buttonText}>
                        {activeIdx === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <AppIntroSlider
            ref={sliderRef}
            data={slides}
            renderItem={renderItem}
            onDone={onDone}
            renderPagination={renderPagination}
            style={{ backgroundColor: '#fff' }}
            contentContainerStyle={{ backgroundColor: '#fff' }}
        />
    );
}

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
    },
    imageArea: {
        width: width * 0.9,
        height: width * 1.05,
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    circleBg: {
        position: 'absolute',
        bottom: 0,
        width: width * 0.66,
        height: width * 0.67,
        borderRadius: width * 0.31,
        backgroundColor: '#7310FF',
    },
    image: {
        position: 'absolute',
        top: 60,
        width: width * 0.8,
        height: width,
        zIndex: 2,
    },
    dot: {
        position: 'absolute',
        width: 34,
        height: 34,
        borderRadius: 18,
        backgroundColor: '#7310FF',
    },
    dotTopLeft: { top: 90, left: 30 },
    dotTopRight: { top: 140, right: 30 },
    dotBottomLeft: { bottom: 65, left: 20 },

    dotMedium: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#7310FF',
    },
    dotMediumTopRight: { top: 80, right: 100 },
    dotMediumRight: { top: '82%', right: 20 },

    dotSmall: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#7310FF',
    },
    dotSmallTopLeft: { top: 230, left: 35 },
    dotSmallTopRight: { top: 70, right: 220 },
    dotSmallBottom: { top: '60%', right: 30 },
    dotTiny: {
        position: 'absolute',
        width: 8,          
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7310FF',
    },
    dotTinyLeft1: { top: 240, left: 30 },   
    dotTinyLeft2: { top: 180, left: 65 },   

    title: {
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 36,
        lineHeight: 37,
        letterSpacing: 0,
        textAlign: 'center',
        paddingHorizontal: 30,
        marginTop: 25,
        color: '#000000',
    },

    paginationRoot: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    paginationWrapper: {
        position: 'absolute',
        bottom: 180,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    paginationDots: {
        flexDirection: 'row',
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9C6F0',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        width: 25,
        backgroundColor: '#7310FF',
    },
    button: {
        backgroundColor: '#7B21FD',
        paddingVertical: 14,
        width: width * 0.85,
        alignItems: 'center',
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});