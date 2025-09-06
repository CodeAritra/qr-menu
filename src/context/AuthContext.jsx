// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  //signup
  async function signup(username, password) {
    try {
      // Make a fake email since Firebase requires email format
      const email = `${username}@myapp.com`;

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user details in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        // serviceType: "menu", //  default
        createdAt: new Date(),
      });

      // console.log("User created:", username);
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  }

  // login.js
  async function login(username, password) {
    try {
      // Map username to email
      const email = `${username}@myapp.com`;

      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // console.log("Logged in as:", userCredential);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error.message);
    }
  }

  //logout
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
