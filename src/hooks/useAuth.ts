import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({ id: fbUser.uid, ...userSnap.data() });
          } else {
            let role = 'FREE';
            if (fbUser.email === 'laispsiqueira@gmail.com') role = 'ADMIN';
            else if (fbUser.email === 'laispsiqueira.3@gmail.com') role = 'PAID';

            const newUser = {
              email: fbUser.email,
              name: fbUser.displayName,
              role: role,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newUser);
            setUser({ id: fbUser.uid, ...newUser });
          }
        } catch (error) {
          console.error("Auth sync error:", error);
          // Safety fallback for dev/demo if Firestore is restricted
          setUser({ id: fbUser.uid, email: fbUser.email, role: 'FREE', name: fbUser.displayName });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading, logout: () => signOut(auth) };
}
