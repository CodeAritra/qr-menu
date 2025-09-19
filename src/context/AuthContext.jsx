// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";

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

      // console.log("userCredential = ", userCredential);

      const cafeRef = doc(db, "cafes", userCredential.user.uid);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 15); // 15 days trial

      await setDoc(cafeRef, {
        name: username || "My Cafe", // use entered name or default
        email: email,
        ownerId: userCredential.user.uid,
        serviceType: "menu", // default service type
        createdAt: serverTimestamp(),
        activated: true,
      });
      toast.success("Signup successfull");
      // console.log("User created:", username);
    } catch (error) {
      toast.error("Signup error");
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
      localStorage.setItem(
        "user",
        JSON.stringify({ username, uid: userCredential.user.uid })
      );
      toast.success("Login successfull");

      // console.log("Logged in as:", userCredential);
      return userCredential.user;
    } catch (error) {
      toast.error("Login error");

      console.error("Login error:", error.message);
    }
  }

  //logout
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      // console.log("User logged out successfully");
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
