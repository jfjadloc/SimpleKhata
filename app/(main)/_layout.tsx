import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563EB', headerShown: false }}>
      <Tabs.Screen 
        name="khata" 
        options={{ title: 'Simple Khata', tabBarIcon: ({color}) => <Ionicons name="book" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="split" 
        options={{ title: 'Bill Split', tabBarIcon: ({color}) => <Ionicons name="calculator" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ title: 'Settings', tabBarIcon: ({color}) => <Ionicons name="settings-outline" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}