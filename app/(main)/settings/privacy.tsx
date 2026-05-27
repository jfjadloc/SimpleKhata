import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Custom Header without SafeAreaView */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.backBtnRow}>
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={styles.backText}>Settings</Text>
        </TouchableOpacity>
        <Image source={require('../../../assets/images/SimpleKhata-icon.png')} style={styles.headerIcon} resizeMode="contain" />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: May 14, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.body}>
            Simple Khata collects minimal data to provide its core services. This includes your name and email address provided during registration, and the manual financial entries (ledger data) you create.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Data Storage & Security</Text>
          <Text style={styles.body}>
            Your data is stored securely using <Text style={styles.bold}>Google Firebase</Text>. We implement Firestore Security Rules to ensure that your financial transactions are private and accessible <Text style={styles.italic}>only</Text> by you through your authenticated account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of Information</Text>
          <Text style={styles.body}>
            We use your information solely to maintain your personal digital ledger and sync your data across your devices. We do not sell, trade, or share your data with third-party advertisers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Deletion</Text>
          <Text style={styles.body}>
            You have full control over your data. You can delete individual transactions at any time. To fully delete your account and all associated data, you can use the account management tools in the Settings tab.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.body}>
            If you have questions regarding this policy or your data, please reach out via the support channels listed in your account settings.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Simple Khata v1.0.0</Text>
          <Text style={styles.footerText}>Built for Secure Personal Accounting</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  
  header: { marginTop: 50, marginBottom: 25, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  headerIcon: { width: 44, height: 44 },

  pageTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },

  backBtn: { 
    padding: 5, 
    marginRight: 15 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0F172A' 
  },
  scrollContent: { 
    paddingHorizontal: 25,
    paddingVertical: 0,
    paddingBottom: 60 
  },
  lastUpdated: { 
    color: '#94A3B8', 
    fontSize: 13, 
    marginBottom: 25,
    fontWeight: '600'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1E293B', 
    marginBottom: 8 
  },
  body: { 
    fontSize: 15, 
    color: '#475569', 
    lineHeight: 24 
  },
  bold: { fontWeight: '700', color: '#0F172A' },
  italic: { fontStyle: 'italic' },
  footer: { 
    marginTop: 0, 
    alignItems: 'center', 
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 30
  },
  footerText: { 
    color: '#CBD5E1', 
    fontSize: 12,
    marginBottom: 4 
  }
});