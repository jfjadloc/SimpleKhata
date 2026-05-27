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
  ScrollView,
  Image
} from 'react-native';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../src/services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Visibility Toggles
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.replace('/(main)/khata'); 
    }
  }, [user]);

  const handleAuth = async () => {
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
        Alert.alert("Invalid Name", "Please enter your full name.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: displayName });
        Alert.alert("Success", `Welcome to Simple Khata, ${displayName}!`);
      }
    } catch (error: any) {
      Alert.alert("Auth Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10B981" /></View>;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#FFF' }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Logo Branding Section */}
        <View style={styles.logoContainer}>
           <View style={styles.logoWrapper}>
              <Image source={require('../../assets/images/SimpleKhata-logo.png')} style={styles.iconImage} resizeMode="contain" />
           </View>
        </View>

        <Text style={styles.instructionText}>
          {isLogin ? 'Please enter your login information' : "Let's create an account"}
        </Text>

        <View style={styles.formContainer}>
          
          <TextInput 
            style={styles.underlineInput} 
            placeholder="Email Address" 
            placeholderTextColor="#CBD5E1"
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {!isLogin && (
            <TextInput 
              style={styles.underlineInput} 
              placeholder="Full Name" 
              placeholderTextColor="#CBD5E1"
              value={displayName} 
              onChangeText={setDisplayName} 
            />
          )}

          <View style={styles.passwordWrapper}>
            <TextInput 
              style={[styles.underlineInput, { flex: 1, borderBottomWidth: 0, marginBottom: 0 }]} 
              placeholder="Password" 
              placeholderTextColor="#CBD5E1"
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeIcon}>
              <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          {!isLogin && <Text style={styles.hintText}>Must contain a number and least of 6 characters</Text>}

          {!isLogin && (
            <>
              <View style={[styles.passwordWrapper, { marginTop: 0 }]}>
                <TextInput 
                  style={[styles.underlineInput, { flex: 1, borderBottomWidth: 0, marginBottom: 0 }]} 
                  placeholder="Confirm Password" 
                  placeholderTextColor="#CBD5E1"
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  secureTextEntry={!showConfirmPwd}
                />
                <TouchableOpacity onPress={() => setShowConfirmPwd(!showConfirmPwd)} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>Must contain a number and least of 6 characters</Text>
            </>
          )}

          <TouchableOpacity 
            style={styles.mainActionBtn} 
            onPress={handleAuth}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.mainActionBtnText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account ? " : "Have an Account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.footerLink}>{isLogin ? 'Sign Up' : 'Log in'}</Text>
          </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 45, paddingTop: 80, paddingBottom: 40, backgroundColor: '#FFF', justifyContent: 'center' },
  
  // Logo Styling
  logoContainer: { alignItems: 'flex-start', marginBottom: 0 },
  logoWrapper: { position: 'relative' },
  iconImage: { width: 250, height: 140 },
  
  instructionText: { textAlign: 'left', color: '#CBD5E1', fontSize: 15, marginBottom: 40 },
  
  // Form Styling
  formContainer: { width: '100%' },
  underlineInput: { 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#E2E8F0', 
    paddingVertical: 8, 
    fontSize: 16, 
    color: '#334155', 
    marginBottom: 10 
  },
  passwordWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#E2E8F0', 
    marginBottom: 5 
  },
  eyeIcon: { padding: 10 },
  hintText: { fontSize: 11, color: '#CBD5E1', marginBottom: 8 },

  mainActionBtn: { 
    backgroundColor: '#333344', 
    padding: 12, 
    borderRadius: 0, 
    alignItems: 'center', 
    marginTop: 30 
  },
  mainActionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // Footer Styling
  footerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 20
  },
  footerText: { color: '#CBD5E1', fontSize: 14 },
  footerLink: { color: '#333344', fontWeight: '900', fontSize: 15 }
});