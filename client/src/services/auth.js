// signup.js
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword,signOut} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

//signup
export async function signup(username, password) {
  try {
    // Make a fake email since Firebase requires email format
    const email = `${username}@myapp.com`;

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save user details in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      username,
      email
    });

    console.log("User created:", username);
  } catch (error) {
    console.error("Signup error:", error.message);
  }
}

// login.js
export async function login(username, password) {
  try {
    // Map username to email
    const email = `${username}@myapp.com`;

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in as:", username);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
  }
}

//logout
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error.message);
  }
};
