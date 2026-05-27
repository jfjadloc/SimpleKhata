import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface BillItem {
  id: string;
  description: string;
  total: number;
  perPerson: number;
}

// --- Header Component (Logo & Title) ---
const SplitterHeader = () => (
  <View style={styles.appHeader}>
    <View style={styles.logoContainer}>
      <Image source={require('../../assets/images/SimpleKhata-icon.png')} style={styles.iconImage} resizeMode="contain" />
    </View>
    <View>
      <Text style={styles.appTitle}>Shared Expense Splitter</Text>
      <Text style={styles.appSub}>A focused utility for instant bill distribution</Text>
    </View>
  </View>
);

// --- Sub-Component: How to use (Landing Notice) ---
const LandingNotice = () => (
  <View style={styles.howToUseCard}>
    <View style={styles.howToHeader}>
      <View style={styles.infoBadge}>
        <Text style={styles.infoBadgeText}>i</Text>
      </View>
      <Text style={styles.howToTitle}>How to use</Text>
    </View>
    <View style={styles.howToList}>
      <Text style={styles.howToItem}>• <Text style={styles.bold}>Initialize Session:</Text> Set participants once.</Text>
      <Text style={styles.howToItem}>• <Text style={styles.bold}>Manual Entry:</Text> Record with full data control.</Text>
      <Text style={styles.howToItem}>• <Text style={styles.bold}>Instant Calculation:</Text> Automatic split results.</Text>
    </View>
  </View>
);

export default function BillSplitterPage() {
  const viewShotRef = useRef<any>(null);
  const [participantCount, setParticipantCount] = useState(2);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [bills, setBills] = useState<BillItem[]>([]);

  const increment = () => setParticipantCount(prev => prev + 1);
  const decrement = () => setParticipantCount(prev => (prev > 2 ? prev - 1 : 2));

  const grandTotal = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const totalPerPerson = participantCount > 0 ? grandTotal / participantCount : 0;

  const handleStartSession = () => {
    if (participantCount > 1) setIsSessionActive(true);
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
      Alert.alert("Error", "Failed to generate image.");
    }
  };

  const resetSession = () => {
    setParticipantCount(2);
    setIsSessionActive(false);
    setBills([]);
  };

  return (
    <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <SplitterHeader />

        {!isSessionActive ? (
          <View style={styles.landingContainer}>
            <LandingNotice />
            <View style={styles.centerSection}>
              <Text style={styles.newSplitTitle}>New Split Session</Text>
              <Text style={styles.newSplitSub}>Define how many participants are sharing costs</Text>
              
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.circleBtn} onPress={decrement}>
                  <Ionicons name="remove" size={28} color="#000" />
                </TouchableOpacity>
                
                <View style={styles.countDisplay}>
                  <Text style={styles.hugeCount}>{participantCount}</Text>
                  <Text style={styles.countLabel}>PARTICIPANTS</Text>
                </View>

                <TouchableOpacity style={styles.circleBtn} onPress={increment}>
                  <Ionicons name="add" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleStartSession}>
                <Text style={styles.primaryBtnText}>Set Group Size</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.sessionContainer}>
            {/* Active Participants Display */}
            <View style={styles.activeParticipantsBox}>
              <View style={styles.activeLeft}>
                  <View style={styles.peopleIconCircle}>
                    <Ionicons name="people-outline" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.activeLabel}>Shared by</Text>
                    <Text style={styles.activeValue}>{participantCount} People</Text>
                  </View>
              </View>
              <TouchableOpacity onPress={resetSession}>
                <Ionicons name="trash" size={24} color="#C2410C" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <TextInput 
                style={styles.textInput} 
                placeholder="Expense Description"   
                placeholderTextColor="#CBD5E1"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput 
                style={styles.textInput} 
                placeholder="Total Amount" 
                placeholderTextColor="#CBD5E1"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={addSharedExpense}>
                <Text style={styles.primaryBtnText}>Record Shared Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Expense Cards */}
            {bills.map((item) => (
              <View key={item.id} style={styles.expenseCard}>
                <View>
                  <Text style={styles.cardTitle}>{item.description}</Text>
                  <Text style={styles.cardTotal}>Total: ₱{item.total.toLocaleString()}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardPerPersonLabel}>Amount per person</Text>
                  <Text style={styles.cardPerPersonValue}>₱{item.perPerson.toLocaleString()}</Text>
                </View>
              </View>
            ))}

            {/* Computational Summary */}
            {bills.length > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>Computational Summary</Text>
                  <TouchableOpacity style={styles.shareBtn} onPress={captureAndShare}>
                    <Ionicons name="share-social" size={14} color="#000" />
                    <Text style={styles.shareBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Grand Total:</Text>
                  <Text style={styles.summaryValue}>₱ {grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Group Size:</Text>
                  <Text style={styles.summaryValue}>{participantCount} pax</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalPerPersonLabel}>Total per Participant</Text>
                  <Text style={styles.totalPerPersonValue}>₱ {totalPerPerson.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9' },
  scrollContent: { padding: 25, paddingBottom: 60 },
  
  // App Logo Header
  appHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30, marginTop: 30, justifyContent: 'space-between' },
  logoContainer: { justifyContent: 'center', alignItems: 'center', },
  iconImage: { width: 50, height: 50 },
  appTitle: { fontSize: 18, fontWeight: '900', color: '#334155', textAlign: 'right' },
  appSub: { fontSize: 10, color: '#64748B',  textAlign: 'right', marginTop: 5 },

  // How to Use Card
  howToUseCard: { borderRadius: 10, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
  howToHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#BFDBFE', justifyContent: 'center', alignItems: 'center' },
  infoBadgeText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 },
  howToTitle: { fontSize: 16, fontWeight: '900', color: '#000' },
  howToList: { gap: 5 },
  howToItem: { fontSize: 12, color: '#000', lineHeight: 18 },
  bold: { fontWeight: 'bold' },

  // Landing Center Content
  landingContainer: { flex: 1, justifyContent: 'center' },
  centerSection: { alignItems: 'center', marginTop: 40 },
  newSplitTitle: { fontSize: 24, fontWeight: '900', color: '#334155', marginBottom: 5 },
  newSplitSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },

  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 40 },
  circleBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  countDisplay: { alignItems: 'center' },
  hugeCount: { fontSize: 72, fontWeight: '900', color: '#000', lineHeight: 80 },
  countLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 1 },

  // Buttons
  primaryBtn: { backgroundColor: '#333344', width: '100%', padding: 18, borderRadius: 5, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Session Styles
  sessionContainer: { width: '100%' },
  activeParticipantsBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#BFDBFE', 
    borderStyle: 'dashed',
    backgroundColor: '#EFF6FF',
    marginBottom: 25
  },
  activeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  peopleIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  activeLabel: { fontSize: 12, color: '#64748B' },
  activeValue: { fontSize: 18, fontWeight: '900', color: '#2563EB' },

  inputSection: { marginBottom: 30 },
  textInput: { borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingVertical: 12, fontSize: 16, marginBottom: 20, color: '#334155' },

  // Expense Card
  expenseCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  cardTotal: { fontSize: 12, color: '#94A3B8' },
  cardRight: { alignItems: 'flex-end' },
  cardPerPersonLabel: { fontSize: 10, color: '#94A3B8' },
  cardPerPersonValue: { fontSize: 18, fontWeight: '900', color: '#3B82F6' },

  // Summary Card
  summaryCard: { 
    backgroundColor: '#F0FDF4', 
    borderRadius: 15, 
    padding: 20, 
    marginTop: 20, 
    borderWidth: 1, 
    borderColor: '#4ADE80', 
    borderStyle: 'dotted' 
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: '#000' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E2E8F0', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 5 },
  shareBtnText: { fontSize: 12, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#334155' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  summaryDivider: { height: 1, borderTopWidth: 1, borderTopColor: '#4ADE80', borderStyle: 'dashed', marginVertical: 12 },
  totalPerPersonLabel: { fontSize: 14, fontWeight: '900', color: '#000' },
  totalPerPersonValue: { fontSize: 16, fontWeight: '900', color: '#000' },
});