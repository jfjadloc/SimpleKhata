import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../src/services/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function KhataDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');

  // --- Real-time Firestore Listener ---
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Logic: Add Entry ---
  const handleAddEntry = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid,
        title,
        amount: parseFloat(amount),
        type,
        createdAt: serverTimestamp(),
      });
      
      // Reset & Close
      setTitle('');
      setAmount('');
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const totals = transactions.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount) || 0;
    curr.type === 'Income' ? (acc.balance += amt) : (acc.balance -= amt, acc.spent += amt);
    return acc;
  }, { balance: 0, spent: 0 });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}><Text style={styles.brandText}>Simple Khata</Text></View>
        <Text style={styles.welcomeText}>Welcome, {user?.displayName?.split(' ')[0] || 'User'}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.balanceValue}>₱{totals.balance.toLocaleString()}</Text>
          </View>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Spent</Text>
            <Text style={styles.spentValue}>₱{totals.spent.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity style={styles.addEntryBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addEntryText}>+ Add Entry</Text>
          </TouchableOpacity>
        </View>

        {transactions.map((item) => (
          <View key={item.id} style={styles.tCard}>
            <View>
              <Text style={styles.tCardTitle}>{item.title}</Text>
              <Text style={styles.tCardType}>{item.type}</Text>
            </View>
            <Text style={[styles.tCardAmount, { color: item.type === 'Income' ? '#16A34A' : '#DC2626' }]}>
              {item.type === 'Income' ? '+' : '-'} ₱{parseFloat(item.amount).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {modalVisible && (
        <View style={styles.customModalOverlay}>
          {/* This touchable handles clicking outside to close */}
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)} 
          />
          
          <View style={styles.customModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* ... keep your typeSelector, inputs, and submitBtn the same ... */}
            <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, type === 'Expense' && styles.typeBtnActiveExpense]} 
                  onPress={() => setType('Expense')}
                >
                  <Text style={[styles.typeBtnText, type === 'Expense' && {color: '#FFF'}]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, type === 'Income' && styles.typeBtnActiveIncome]} 
                  onPress={() => setType('Income')}
                >
                  <Text style={[styles.typeBtnText, type === 'Income' && {color: '#FFF'}]}>Income</Text>
                </TouchableOpacity>
              </View>

              <TextInput 
                style={styles.input} 
                placeholder="Title (e.g. Lunch)"  
                placeholderTextColor="#94A3B8"
                value={title} 
                onChangeText={setTitle} 
              />
              <TextInput 
                style={styles.input} 
                placeholder="Amount (₱)"  
                placeholderTextColor="#94A3B8"
                keyboardType="numeric" 
                value={amount} 
                onChangeText={setAmount} 
              />

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleAddEntry}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Save Transaction</Text>}
              </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  brandText: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginVertical: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 30 },
  cardSmall: { flex: 1, backgroundColor: '#FFF', padding: 18, borderRadius: 24, elevation: 3 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  balanceValue: { fontSize: 16, fontWeight: '900', color: '#16A34A' },
  spentValue: { fontSize: 16, fontWeight: '900', color: '#DC2626' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  addEntryBtn: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addEntryText: { color: '#FFF', fontWeight: '700' },
  tCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 22, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tCardTitle: { fontSize: 16, fontWeight: '700' },
  tCardType: { fontSize: 12, color: '#94A3B8' },
  tCardAmount: { fontSize: 16, fontWeight: '900' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  typeBtnActiveExpense: { backgroundColor: '#DC2626' },
  typeBtnActiveIncome: { backgroundColor: '#16A34A' },
  typeBtnText: { fontWeight: '700', color: '#64748B' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15 },
  submitBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },

  // Replace your old Modal styles with these:
customModalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'flex-end',
  zIndex: 1000, // Ensures it sits above the Tabs
},
backdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
},
customModalContent: {
  backgroundColor: '#FFF',
  padding: 25,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  minHeight: 400,
  width: '100%',
  // This ensures the content doesn't get cut off by the phone's rounded corners
  paddingBottom: 40, 
},
});