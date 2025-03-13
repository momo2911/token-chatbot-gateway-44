
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const useTokenBalance = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return () => {};
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setTokenBalance(doc.data().tokens || 100);
      } else {
        setTokenBalance(0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error getting token balance:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return { tokenBalance, loading };
};
