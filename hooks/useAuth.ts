import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0); // The "Force Refresh" trigger

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [version]); // Hook re-runs if version changes

  const refreshUser = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        // Incrementing the version forces the useEffect above to re-sync
        setVersion(v => v + 1); 
        return true;
      }
    } catch (e) {
      console.error("Refresh Error:", e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, logout, refreshUser };
};