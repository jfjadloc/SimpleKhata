import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../../../src/services/firebaseConfig';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UpdateProfile() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  // Form States
  const [name, setName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Cross-platform Alert Helper
  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
    }
  };

  const handleUpdate = async () => {
    // 1. Validation
    if (!name.trim()) {
      showAlert("Required", "Please enter your full name.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showAlert("Security", "Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!auth.currentUser) throw new Error("No authenticated user found.");

      // 2. Update Display Name
      if (name !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      // 3. Update Password (if provided)
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      // 4. Force global state refresh
      await refreshUser();

      // 5. Success Feedback
      showAlert(
        "Success", 
        "Your profile has been updated.", 
        () => router.replace('/(main)/settings')
      );

    } catch (error: any) {
      console.error("Update Error:", error);
      
      if (error.code === 'auth/requires-recent-login') {
        showAlert("Security Timeout", "Please log out and log back in to change security settings.");
      } else {
        showAlert("Error", error.message || "Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - No SafeAreaView, manual padding */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.backBtnRow}>
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Image 
          source={require('../../../assets/images/SimpleKhata-icon.png')} 
          style={styles.headerIcon} 
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Context Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Personal details help identify your ledger entries. Email is restricted as your primary account ID.
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="Jan Francis"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Read-Only Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>{user?.email}</Text>
            <Ionicons name="lock-closed" size={16} color="#94A3B8" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <Text style={styles.hint}>Leave blank to keep your current password.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>New Password</Text>
          <TextInput 
            style={styles.input} 
            value={newPassword} 
            onChangeText={setNewPassword} 
            secureTextEntry 
            placeholder="Min. 6 characters"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput 
            style={styles.input} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            placeholder="Repeat new password"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save All Changes</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Simple Khata v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { marginTop: 50, marginBottom: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , paddingHorizontal: 25 },
  backBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  headerIcon: { width: 44, height: 44 },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { paddingHorizontal: 25, paddingTop: 0, paddingBottom: 60 },
  infoBox: { 
    backgroundColor: '#EFF6FF', 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 5 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { 
    backgroundColor: '#F8FAFC', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A'
  },
  disabledInput: { 
    backgroundColor: '#F1F5F9', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  disabledText: { color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 15 },
  saveBtn: { 
    backgroundColor: '#0F172A', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 }
    })
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 40 }
});