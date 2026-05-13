import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const MobilePreviewWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider>
      {Platform.OS !== 'web' ? (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <StatusBar barStyle="dark-content" />
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

const webStyles = StyleSheet.create({
  pageBackground: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  phoneContainer: {
    width: 375, height: 812, backgroundColor: '#fff', borderRadius: 30,
    overflow: 'hidden', borderWidth: 8, borderColor: '#333',
  },
});