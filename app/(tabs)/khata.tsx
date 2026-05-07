import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../src/services/firebaseConfig'; // Ensure this path matches your config
import { useAuth } from '../../hooks/useAuth'; // Custom hook we discussed
import { Ionicons } from '@expo/vector-icons';

export default function KhataPage() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Logic: Authentication Handler ---
  const handleAuth = async () => {
    // Basic Validation
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in all required credentials.");
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "The passwords you entered do not match.");
        return;
      }
      if (displayName.trim().length < 2) {
        Alert.alert("Invalid Name", "Please enter your full name for the ledger profile.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Firebase profile with the Display Name
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        Alert.alert("Success", `Welcome to Simple Khata, ${displayName}!`);
      }
    } catch (error: any) {
      let errorMessage = "An error occurred during authentication.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "This email is already registered.";
      if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      if (error.code === 'auth/user-not-found') errorMessage = "No account found with this email.";
      
      Alert.alert("Auth Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // --- View: Logged In (Ledger View) ---
  if (user) {
    return (
      <View style={styles.center}>
        <Ionicons name="book-outline" size={64} color="#2563EB" />
        <Text style={styles.title}>Welcome, {user.displayName || 'Reese'}</Text>
        <Text style={styles.subtitle}>Your synced Khata ledger is active.</Text>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: '#EF4444', marginTop: 20 }]} 
          onPress={() => auth.signOut()}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- View: Logged Out (Robust Auth Form) ---
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Ionicons name={isLogin ? "lock-open" : "person-add"} size={32} color="#2563EB" />
          </View>
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join Simple Khata'}</Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Sign in to access your manual expense records.' 
              : 'Create a profile to sync your debts across devices.'}
          </Text>
        </View>

        <View style={styles.formCard}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your full name" 
                placeholderTextColor="#94A3B8"
                value={displayName} 
                onChangeText={setDisplayName} 
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="name@email.com" 
              placeholderTextColor="#94A3B8"
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              placeholderTextColor="#94A3B8"
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#94A3B8"
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry 
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.primaryButton, isProcessing && { opacity: 0.7 }]} 
            onPress={handleAuth}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchTouch}>
          <Text style={styles.switchText}>
            {isLogin ? "New to Khata? Create an account" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },
  formCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  primaryButton: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  switchTouch: { marginTop: 25, padding: 10 },
  switchText: { textAlign: 'center', color: '#2563EB', fontWeight: '700', fontSize: 14 }
});