import React from 'react';
import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// This stays here and wraps EVERYTHING in the app
export const MobilePreviewWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <SafeAreaProvider>
            {Platform.OS !== 'web' ? (
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    {children}
                </View>
            ) : (
                <View style={webStyles.pageBackground}>
                    <View style={webStyles.phoneContainer}>
                        {children}
                    </View>
                </View>
            )}
        </SafeAreaProvider>
    );
};

export default function RootLayout() {
    return (
        <MobilePreviewWrapper>
            <Stack screenOptions={{ headerShown: false }}>
                {/* The app now looks for these two main groups */}
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </MobilePreviewWrapper>
    );
}

const webStyles = StyleSheet.create({
    pageBackground: {
        flex: 1,
        backgroundColor: '#121212', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneContainer: {
        width: 375,  
        height: 812, 
        backgroundColor: '#fff',
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 8,
        borderColor: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
});