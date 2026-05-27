import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { auth } from '../../../src/services/firebaseConfig';

// Define the interface for our menu items to prevent TypeScript errors
interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
  onPress: () => void;
}

export default function SettingsIndex() {
  const { logout } = useAuth();
  const router = useRouter();
  
  // Local state to force the name to update immediately on focus
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName);
  const [email, setEmail] = useState(auth.currentUser?.email);

  // This hook ensures every time you 'go back' to this screen, the data refreshes
  useFocusEffect(
    useCallback(() => {
      const refreshLocalData = async () => {
        if (auth.currentUser) {
          await auth.currentUser.reload(); // Final check to ensure we have latest data
          setDisplayName(auth.currentUser.displayName);
          setEmail(auth.currentUser.email);
        }
      };
      refreshLocalData();
    }, [])
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(guest)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header Layout */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/SimpleKhata-icon.png')} style={styles.iconImage} resizeMode="contain" />
        </View>
        <View style={styles.headerTitles}>
          <Text style={styles.appTitle}>Settings</Text>
          <Text style={styles.appSub}>Manage your account</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>

        <View style={styles.menuGroup}>
          <Text style={styles.menuLabel}>Account Settings</Text>
          
          <SettingsItem 
            icon="person-outline" 
            title="Personal Information" 
            sub="Update name and change password"
            onPress={() => router.push('/settings/profile')}
          />
          
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title="Privacy Policy" 
            sub="How we protect your data"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Simple Khata v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// Fixed SettingsItem Sub-component
function SettingsItem({ icon, title, sub, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemIconContainer}>
        <Ionicons name={icon} size={22} color="#475569" />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 25,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  scrollContent: { padding: 25 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  headerSection: { flexDirection: 'row', alignItems: 'center', marginTop: 75, marginBottom: 25, gap: 15, paddingHorizontal: 25 },
  headerTitles: { flex: 1 },
  welcomeText: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitleText: { fontSize: 13, color: '#64748B', marginTop: 2 },

  logoContainer: { justifyContent: 'center', alignItems: 'center', },
  iconImage: { width: 50, height: 50 },
  appTitle: { fontSize: 18, fontWeight: '900', color: '#334155', textAlign: 'right' },
  appSub: { fontSize: 10, color: '#64748B',  textAlign: 'right', marginTop: 5 },
  
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  menuGroup: { marginBottom: 30 },
  menuLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    marginTop: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: '700', marginLeft: 10, fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 30 },
});