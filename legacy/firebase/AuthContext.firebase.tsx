import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("Auth state changed - User logged in:", firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log("User data retrieved from Firestore");
            setUser(userData);
            setIsAdmin(userData.isAdmin);
          } else {
            console.log("User document doesn't exist in Firestore");
            // Create a basic user object from auth data
            const basicUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              isAdmin: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setUser(basicUser);
            
            // Try to create the user document in Firestore
            try {
              await setDoc(doc(db, 'users', basicUser.uid), basicUser);
              console.log("Created user document in Firestore");
            } catch (error) {
              console.error("Failed to create user document in Firestore:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Create a basic user object from auth data if Firestore is unavailable
          const basicUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            isAdmin: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setUser(basicUser);
        }
      } else {
        console.log("Auth state changed - User logged out");
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        uid: userCredential.user.uid,
        email,
        displayName: name,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(doc(db, 'users', newUser.uid), newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // After login, fetch the user data from Firestore and update state
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setIsAdmin(userData.isAdmin);
        } else {
          // If user doc doesn't exist in Firestore, create a basic one
          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || email,
            displayName: userCredential.user.displayName || email.split('@')[0],
            isAdmin: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await setDoc(doc(db, 'users', newUser.uid), newUser);
          setUser(newUser);
        }
      } catch (fetchError) {
        console.error('Error fetching user data after login:', fetchError);
        // Create a basic user object from auth data if Firestore is unavailable
        const basicUser: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setUser(basicUser);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logout called in AuthContext");
      // First clear the local state
      setUser(null);
      setIsAdmin(false);
      // Then sign out from Firebase
      await signOut(auth);
      console.log("Firebase signOut completed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error('Error in AuthContext logout:', error);
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 