import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { deleteToken } from '../utils/api';
import { useBookmarks } from '../context/BookmarkContext';

export default function ProfileScreen() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { refreshForUser } = useBookmarks();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await deleteToken();
            await refreshForUser(); // switch back to guest bookmarks key
            router.replace('/letYouIn');
        } catch (err) {
            Alert.alert('Error', 'Could not log out. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontFamily: 'Roboto_800ExtraBold',
        fontSize: 28,
        color: '#000',
        marginBottom: 40,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 40,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
});