import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// --- Interfaces ---
interface BillItem {
  id: string;
  description: string;
  total: number;
  perPerson: number;
}

// --- Sub-Component: Landing Notice ---
const LandingNotice = () => (
  <View style={styles.noticeContainer}>
    <View style={styles.headerRow}>
      <Ionicons name="information-circle" size={20} color="#2563EB" />
      <Text style={styles.noticeTitle}>Shared Expense Splitter</Text>
    </View>
    <Text style={styles.tagline}>A focused utility for instant bill distribution.</Text>
    <View style={styles.listContainer}>
      <Text style={styles.listText}><Text style={styles.bold}>• Initialize Session:</Text> Set participants once.</Text>
      <Text style={styles.listText}><Text style={styles.bold}>• Manual Entry:</Text> Record with full data control.</Text>
      <Text style={styles.listText}><Text style={styles.bold}>• Instant Calculation:</Text> Automatic split results.</Text>
    </View>
    <View style={styles.footerNote}>
      <Text style={styles.footerText}>
        <Text style={{fontStyle: 'italic'}}>Note:</Text> This is for active calculation. For long-term tracking, use the <Text style={{color: '#2563EB', fontWeight: '700'}}>Khata</Text> tab.
      </Text>
    </View>
  </View>
);

export default function BillSplitterPage() {
  // --- Refs & State ---
  const viewShotRef = useRef<any>(null);
  const [participantCount, setParticipantCount] = useState(2); // Start with a sensible default
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [bills, setBills] = useState<BillItem[]>([]);

  const increment = () => setParticipantCount(prev => prev + 1);
  const decrement = () => setParticipantCount(prev => (prev > 2 ? prev - 1 : 2));

  // --- Logic ---
  const grandTotal = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalPerPerson = participantCount > 0 
    ? grandTotal / participantCount 
    : 0;

  const handleStartSession = () => {
    // Direct comparison works now
    if (participantCount > 1) {
        setIsSessionActive(true);
    } else {
        Alert.alert("Invalid Group", "Please enter at least 2 participants.");
    }
  };

  const addSharedExpense = () => {
    const totalValue = parseFloat(amount);
    if (description && totalValue > 0) {
      const newItem: BillItem = {
        id: Date.now().toString(),
        description,
        total: totalValue,
        perPerson: totalValue / participantCount,
      };
      setBills([newItem, ...bills]);
      setDescription('');
      setAmount('');
    }
  };

  const captureAndShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Capture failed:", error);
      Alert.alert("Error", "Failed to generate image.");
    }
  };

  const resetSession = () => {
    setParticipantCount(2); // Set to 2 (or your preferred default number)
    setIsSessionActive(false);
    setBills([]); // Clear the list if needed
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {!isSessionActive ? (
            <View>
              <LandingNotice />
              <View style={styles.promptCard}>
                <View style={styles.iconCircle}>
                  <Ionicons name="people" size={40} color="#2563EB" />
                </View>
                <Text style={styles.promptTitle}>New Split Session</Text>
                <Text style={styles.promptSub}>Define how many participants are sharing costs.</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity style={styles.stepButton} onPress={decrement}>
                    <Ionicons name="remove" size={32} color="#2563EB" />
                  </TouchableOpacity>
                  
                  <View style={styles.numberDisplay}>
                    <Text style={styles.hugeNumber}>{participantCount}</Text>
                    <Text style={styles.label}>Participants</Text>
                  </View>

                  <TouchableOpacity style={styles.stepButton} onPress={increment}>
                    <Ionicons name="add" size={32} color="#2563EB" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={handleStartSession}>
                  <Text style={styles.buttonText}>Initialize Split</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.sessionHeader}>
                <View>
                  <Text style={styles.headerLabel}>Shared by</Text>
                  <Text style={styles.headerValue}>{participantCount} Participants</Text>
                </View>
                <TouchableOpacity onPress={resetSession} style={styles.resetBtn}>
                  <Text style={styles.resetText}>New Session</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputCard}>
                <TextInput 
                  style={styles.inputField} 
                  placeholder="Expense Description"   
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                />
                <TextInput 
                  style={styles.inputField} 
                  placeholder="Total Amount (₱)" 
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addSharedExpense}>
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.addBtnText}>Record Shared Expense</Text>
                </TouchableOpacity>
              </View>

              {bills.map((item) => (
                <View key={item.id} style={styles.expenseItem}>
                  <View style={{flex: 1}}>
                    <Text style={styles.expenseTitle}>{item.description}</Text>
                    <Text style={styles.totalLabel}>Total: ₱{item.total.toLocaleString()}</Text>
                  </View>
                  <View style={styles.splitResult}>
                    <Text style={styles.perPersonLabel}>AMOUNT PER PERSON</Text>
                    <Text style={styles.perPersonValue}>₱{item.perPerson.toLocaleString()}</Text>
                  </View>
                </View>
              ))}

              {bills.length > 0 && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryTitle}>Session Summary</Text>
                    <TouchableOpacity style={styles.shareButton} onPress={captureAndShare}>
                      <Ionicons name="share-social" size={16} color="#059669" />
                      <Text style={styles.shareText}>Share Image</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Grand Total:</Text>
                    <Text style={styles.summaryValue}>₱{grandTotal.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.mainRow]}>
                    <Text style={styles.mainLabel}>Total per Participant:</Text>
                    <Text style={styles.mainValue}>₱{totalPerPerson.toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </ViewShot>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  
  // Notice
  noticeContainer: { backgroundColor: '#F0F7FF', borderRadius: 16, padding: 20, margin: 15, borderWidth: 1, borderColor: '#DBEAFE' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  noticeTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  tagline: { fontSize: 13, color: '#475569', marginBottom: 12 },
  listContainer: { gap: 6, marginBottom: 12 },
  listText: { fontSize: 12, color: '#334155' },
  bold: { fontWeight: '700' },
  footerNote: { borderTopWidth: 1, borderTopColor: '#DBEAFE', paddingTop: 10 },
  footerText: { fontSize: 11, color: '#64748B' },

  // Prompt
  promptCard: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  promptTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  promptSub: { fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' },
  hugeInput: { fontSize: 64, fontWeight: 'bold', color: '#2563EB', textAlign: 'center', marginBottom: 30, width: '100%' },
  primaryButton: { backgroundColor: '#2563EB', width: '90%', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Session
  sessionHeader: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerLabel: { fontSize: 11, color: '#64748B', textTransform: 'uppercase' },
  headerValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  resetBtn: { padding: 8 },
  resetText: { color: '#2563EB', fontWeight: '600', fontSize: 12 },
  inputCard: { backgroundColor: '#FFF', margin: 15, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  inputField: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 12, fontSize: 16, marginBottom: 10 },
  addBtn: { backgroundColor: '#0F172A', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700' },

  // List
  expenseItem: { backgroundColor: '#FFF', marginHorizontal: 15, marginBottom: 10, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#2563EB' },
  expenseTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  totalLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  splitResult: { alignItems: 'flex-end' },
  perPersonLabel: { fontSize: 9, color: '#64748B', fontWeight: '800' },
  perPersonValue: { fontSize: 18, fontWeight: '900', color: '#2563EB' },

  // Summary
  summaryCard: { backgroundColor: '#ECFDF5', margin: 15, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#D1FAE5', marginTop: 20 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#065F46' },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  shareText: { fontSize: 11, color: '#059669', fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  mainRow: { borderTopWidth: 1, borderTopColor: '#D1FAE5', paddingTop: 15, marginTop: 5 },
  summaryLabel: { color: '#065F46', fontSize: 14 },
  summaryValue: { fontWeight: '700', color: '#065F46', fontSize: 14 },
  mainLabel: { fontWeight: '800', color: '#065F46', fontSize: 15 },
  mainValue: { fontWeight: '900', color: '#059669', fontSize: 24 },

  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, marginVertical: 40, },
  stepButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DBEAFE', },
  numberDisplay: { alignItems: 'center', minWidth: 100, },
  hugeNumber: { fontSize: 80, fontWeight: '900', color: '#0F172A', },
  label: { fontSize: 14, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', },
});