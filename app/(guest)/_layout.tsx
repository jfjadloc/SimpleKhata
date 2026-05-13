import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function GuestLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563EB', headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Bill Split', tabBarIcon: ({color}) => <Ionicons name="calculator" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="login" 
        options={{ title: 'Simple Khata', tabBarIcon: ({color}) => <Ionicons name="book" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}