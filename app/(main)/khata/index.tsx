import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  ActivityIndicator, TextInput, Alert, Platform, Image
} from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../src/services/firebaseConfig';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, updateDoc, doc, serverTimestamp, limit, deleteDoc 
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function KhataDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  
  // ALL FUNCTIONAL FIELDS RESTORED EXACTLY
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [details, setDetails] = useState(''); // <-- Restored
  
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!modalVisible) {
      setDetails('');
      setTitle('');
      setAmount('');
    }
  }, [modalVisible]);

  const openAddModal = () => {
    setIsEditing(false);
    setTitle('');
    setAmount('');
    setDetails(''); 
    setType('Expense');
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setCurrentDocId(item.id);
    setTitle(item.title || '');
    setAmount(item.amount ? item.amount.toString() : '');
    setDetails(item.details || ''); 
    setType(item.type || 'Expense');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title || !amount) return Alert.alert("Missing Info", "Title and amount are required.");
    
    try {
      const payload = {
        title,
        amount: parseFloat(amount),
        type,
        details, // <-- Saved to Firestore
        updatedAt: serverTimestamp(),
      };

      if (isEditing && currentDocId) {
        await updateDoc(doc(db, "transactions", currentDocId), payload);
      } else {
        await addDoc(collection(db, "transactions"), {
          ...payload,
          userId: user?.uid,
          createdAt: serverTimestamp(),
        });
      }
      setModalVisible(false);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const totals = transactions.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount) || 0;
    curr.type === 'Income' ? (acc.balance += amt) : (acc.balance -= amt, acc.spent += amt);
    return acc;
  }, { balance: 0, spent: 0 });

  const handleDelete = async () => {
    if (!currentDocId) return;

    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "transactions", currentDocId));
        setModalVisible(false);
        setCurrentDocId(null);
      } catch (error) {
        console.error("Delete Error:", error);
        Alert.alert("Error", "Could not delete transaction.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Delete this entry?")) {
        await performDelete();
      }
    } else {
      Alert.alert(
        "Delete Entry",
        "Are you sure you want to remove this?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete }
        ]
      );
    }
  };

  if (loading) return <View style={styles.centerClient}><ActivityIndicator size="large" color="#10B981" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Layout */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/SimpleKhata-icon.png')} style={styles.iconImage} resizeMode="contain" />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.appTitle}>Welcome back, {user?.displayName || 'User'}</Text>
            <Text style={styles.appSub}>Manage your personal finances</Text>
          </View>
        </View>

        {/* Metrics Matrix */}
        <View style={styles.summaryRow}>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>₱ {totals.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </View>
          <View style={styles.cardSmall}>
            <Text style={styles.cardLabel}>Total Spent</Text>
            <Text style={styles.spentValue}>₱ {totals.spent.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </View>
        </View>

        {/* Action Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity style={styles.addEntryBtn} onPress={openAddModal}>
            <Text style={styles.addEntryText}>+ Add Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History Block */}
        {transactions.map((item) => (
          <TouchableOpacity key={item.id} style={styles.tCard} onPress={() => openEditModal(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tCardTitle}>{item.title}</Text>
              <Text style={styles.tCardMeta}>{item.type}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.tCardAmount, { color: item.type === 'Income' ? '#10B981' : '#EF4444' }]}>
                ₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </Text>
              <Text style={styles.tCardDate}>
                {item.createdAt?.toDate 
                  ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                  : 'Just now'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {transactions.length >= 5 && (
          <TouchableOpacity 
            style={styles.seeAllBtn} 
            onPress={() => router.push('/khata/history')}>
            <Text style={styles.seeAllText}>View all transactions</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.lastUpdateText}>
          Last Update: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </ScrollView>

      {/* ENTRY SHEET MODAL (WITH NOTE FIELD RESTORED) */}
      {modalVisible && (
        <View style={styles.customModalOverlay}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.customModalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Transaction' : 'Add new transaction'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close-outline" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            {/* <Text style={styles.fieldLabel}>Entry Type</Text> */}
            {/* Segment Selector layout fixed to match image_804107.png */}
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'Income' ? styles.typeBtnActive : styles.typeBtnInactive]} 
                onPress={() => setType('Income')}
              >
                <Text style={[styles.typeBtnText, type === 'Income' && styles.typeBtnTextActive]}>Income</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'Expense' ? styles.typeBtnActive : styles.typeBtnInactive]} 
                onPress={() => setType('Expense')}
              >
                <Text style={[styles.typeBtnText, type === 'Expense' && styles.typeBtnTextActive]}>Expense</Text>
              </TouchableOpacity>
            </View>

            {/* Uniform Bottom Border Forms */}
            <TextInput 
              style={styles.underlineInput} 
              placeholder="Enter purpose of transaction" 
              placeholderTextColor="#CBD5E1" 
              value={title} 
              onChangeText={setTitle} 
            />
            
            <TextInput 
              style={styles.underlineInput} 
              placeholder="Total Amount (₱)" 
              placeholderTextColor="#CBD5E1" 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={setAmount} 
            />

            {/* RESTORED NOTE/DETAILS FORM ELEMENT */}
            <TextInput 
              style={[styles.underlineInput, { minHeight: 60, marginBottom: 25 }]} 
              placeholder="Add a note or comment..." 
              placeholderTextColor="#CBD5E1"
              multiline
              value={details} 
              onChangeText={setDetails} 
            />

            <View style={styles.actionRowContainer}>
              {isEditing && (
                <TouchableOpacity style={styles.deleteActionBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={[styles.submitBtn, { flex: isEditing ? 2 : 1 }]} onPress={handleSave}>
                <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Add transaction'}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerClient: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 25, backgroundColor: '#FFF' },
  
  headerSection: { flexDirection: 'row', alignItems: 'center', marginTop: 75, marginBottom: 25, gap: 15 },
  headerTitles: { flex: 1 },
  welcomeText: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitleText: { fontSize: 13, color: '#64748B', marginTop: 2 },

  logoContainer: { justifyContent: 'center', alignItems: 'center', },
  iconImage: { width: 50, height: 50 },
  appTitle: { fontSize: 18, fontWeight: '900', color: '#334155', textAlign: 'right' },
  appSub: { fontSize: 10, color: '#64748B',  textAlign: 'right', marginTop: 5 },
  
  summaryRow: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  cardSmall: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#F8FAFC', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 15, elevation: 2 },
  cardLabel: { fontSize: 10, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  balanceValue: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  spentValue: { fontSize: 16, fontWeight: '900', color: '#EF4444' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  addEntryBtn: { backgroundColor: '#333344', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 5 },
  addEntryText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  tCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 1 },
  tCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  tCardMeta: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  tCardAmount: { fontSize: 15, fontWeight: '900' },
  tCardDate: { fontSize: 11, color: '#CBD5E1', marginTop: 3 },
  
  seeAllBtn: { backgroundColor: '#333344', paddingVertical: 14, borderRadius: 6, marginTop: 15, alignItems: 'center' },
  seeAllText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  lastUpdateText: { textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 40 },

  // Interactive Form Sheet Overlay
  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 1000 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  customModalContent: { backgroundColor: '#FFF', padding: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  
  fieldLabel: { fontSize: 13, color: '#334155', fontWeight: '700', marginBottom: 8 },
  
  // Custom Selector UI Framework (from image_804107.png)
  typeSelector: { flexDirection: 'row', borderWidth: 1.5, borderColor: '#333344', borderRadius: 4, overflow: 'hidden', marginBottom: 25 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  typeBtnInactive: { backgroundColor: '#FFF' },
  typeBtnActive: { backgroundColor: '#333344' },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: '#333344' },
  typeBtnTextActive: { color: '#FFF' },
  
  underlineInput: { borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingVertical: 12, fontSize: 15, color: '#334155', marginBottom: 25 },
  
  // Handling Controls Array
  actionRowContainer: { flexDirection: 'row', gap: 12, marginTop: 10 },
  submitBtn: { backgroundColor: '#333344', padding: 16, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  deleteActionBtn: { flex: 1, backgroundColor: '#EF4444', flexDirection: 'row', gap: 6, padding: 16, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});