import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { auth } from '../../src/services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const performSignOut = async () => {
        try {
        await auth.signOut();
        // Explicitly move the user on web to break the URL stickiness
        if (Platform.OS === 'web') {
            router.replace('/(guest)/login');
        }
        } catch (error) {
        console.error("Logout Error:", error);
        }
    };

    if (Platform.OS === 'web') {
        // Web version using standard browser confirm
        if (window.confirm("Are you sure you want to log out?")) {
        await performSignOut();
        }
    } else {
        // Native version (iPhone) using Alert
        Alert.alert(
        "Sign Out",
        "Are you sure you want to log out?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: performSignOut }
        ]
        );
    }
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Simple Khata v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  header: { marginTop: 20, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  profileSection: { 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 25, 
    borderRadius: 24,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#EFF6FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#2563EB' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  menuSection: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 40 }
});