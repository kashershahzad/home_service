import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Asset } from 'expo-asset';
import { useEffect } from 'react';
import {
  useFonts,
  Roboto_800ExtraBold,
} from '@expo-google-fonts/roboto';
import { BookmarkProvider } from '../context/BookmarkContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_800ExtraBold,
  });

  useEffect(() => {
    Asset.loadAsync([
      require('C:/Users/User/Desktop/HomeServiceApp/assets/images/onboarding/onboarding1.png'),
      require('C:/Users/User/Desktop/HomeServiceApp/assets/images/onboarding/onboarding2.png'),
      require('C:/Users/User/Desktop/HomeServiceApp/assets/images/onboarding/onboarding3.png'),
      require('../assets/images/login-illustration.png'),
      require('../assets/images/fingerprint.png'),
      require('../assets/images/not-found.png')
    ]);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <BookmarkProvider>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </BookmarkProvider>
  );
}