import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth'; 
import { MobilePreviewWrapper } from '../src/components/MobilePreviewWrapper';
import { ProtectedRoute } from '../src/components/ProtectedRoute'; // Import the guard

export default function RootLayout() {
  return (
    <MobilePreviewWrapper>
      <ProtectedRoute>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(guest)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ProtectedRoute>
    </MobilePreviewWrapper>
  );
}