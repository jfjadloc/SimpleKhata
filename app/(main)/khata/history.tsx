import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, TextInput, Alert, Platform, Image
} from 'react-native';
import { 
  collection, query, where, orderBy, limit, 
  startAfter, getDocs, updateDoc, doc, serverTimestamp, 
  addDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../../../src/services/firebaseConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';

export default function AllTransactions() {
  const { user } = useAuth();
  const router = useRouter();
  
  // List States
  const [list, setList] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  
  // Form Input States
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');

  const fetchTransactions = async (isNextPage = false) => {
    if (!user || loading || (isNextPage && !hasMore)) return;
    setLoading(true);
    try {
      let q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      if (isNextPage && lastDoc) q = query(q, startAfter(lastDoc));
      const snapshot = await getDocs(q);
      const newData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHasMore(newData.length === 10);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setList(prev => isNextPage ? [...prev, ...newData] : newData);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, [user]);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDocId(null);
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
        details, 
        updatedAt: serverTimestamp() 
      };

      if (isEditing && currentDocId) {
        // Handle Editing Existing Entry
        await updateDoc(doc(db, "transactions", currentDocId), payload);
        setList(prev => prev.map(item => item.id === currentDocId ? { ...item, ...payload } : item));
      } else {
        // Handle Creating Brand New Entry Locally
        const docRef = await addDoc(collection(db, "transactions"), {
          ...payload,
          userId: user?.uid,
          createdAt: serverTimestamp(),
        });
        
        const newLocalItem = {
          id: docRef.id,
          ...payload,
          userId: user?.uid,
          createdAt: { toDate: () => new Date() }
        };
        setList(prev => [newLocalItem, ...prev]);
      }
      
      setModalVisible(false);
    } catch (e) { 
      console.error("Save error:", e);
      Alert.alert("Error", "Save failed"); 
    }
  };

  const handleDelete = async () => {
    if (!currentDocId) return;

    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "transactions", currentDocId));
        setList(prev => prev.filter(item => item.id !== currentDocId));
        setModalVisible(false);
        setCurrentDocId(null);
      } catch (error) {
        console.error("Delete Error:", error);
        Alert.alert("Error", "Could not delete transaction.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this entry?")) {
        await performDelete();
      }
    } else {
      Alert.alert(
        "Delete Entry",
        "This action cannot be undone. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Nav Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnRow}>
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
        <Image source={require('../../../assets/images/SimpleKhata-icon.png')} style={styles.headerIcon} resizeMode="contain" />
      </View>

      {/* Screen Interactive Head Controls */}
      <View style={styles.actionRow}>
        <Text style={styles.screenTitle}>All Transactions</Text>
        <TouchableOpacity style={styles.addBtnSmall} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>

      {loading && list.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#333344" />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          onEndReached={() => fetchTransactions(true)}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.tCard} onPress={() => openEditModal(item)}>
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
          )}
        />
      )}

      <Text style={styles.lastUpdateText}>
        Last Update: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {/* MODAL BOTTOM SHEET WRAPPER */}
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
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 30 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { marginTop: 75, marginBottom: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  headerIcon: { width: 44, height: 44 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  addBtnSmall: { backgroundColor: '#333344', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 5 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  tCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f2f2f2' },
  tCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  tCardMeta: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  tCardAmount: { fontSize: 15, fontWeight: '900' },
  tCardDate: { fontSize: 11, color: '#CBD5E1', marginTop: 3 },
  
  lastUpdateText: { textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 20, marginBottom: 25 },

  customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 1000 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  customModalContent: { backgroundColor: '#FFF', padding: 30, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  
  fieldLabel: { fontSize: 13, color: '#334155', fontWeight: '700', marginBottom: 8 },
  
  typeSelector: { flexDirection: 'row', borderWidth: 1, borderColor: '#333344', borderRadius: 4, overflow: 'hidden', marginBottom: 25 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  typeBtnInactive: { backgroundColor: '#FFF' },
  typeBtnActive: { backgroundColor: '#333344' },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: '#333344' },
  typeBtnTextActive: { color: '#FFF' },
  
  underlineInput: { borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingVertical: 12, fontSize: 15, color: '#334155', marginBottom: 25 },
  
  actionRowContainer: { flexDirection: 'row', gap: 12, marginTop: 10 },
  submitBtn: { backgroundColor: '#333344', padding: 16, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  deleteActionBtn: { flex: 1, backgroundColor: '#EF4444', flexDirection: 'row', gap: 6, padding: 16, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});