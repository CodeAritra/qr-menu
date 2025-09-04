import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

// Get menu reference for a user
const menuRef = (uid) => collection(db, "users", uid, "menuItems");

// CREATE
export const addMenuItem = async (uid, item) => {
  const docRef = await addDoc(menuRef(uid), item);
  return { id: docRef.id, ...item };
};

// READ all
export const fetchMenuItems = async (uid) => {
  const snap = await getDocs(query(menuRef(uid), orderBy("category")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// REALTIME (UI auto-updates)
export const subscribeMenu = (uid, callback) => {
  return onSnapshot(query(menuRef(uid), orderBy("category")), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// UPDATE
export const updateMenuItem = async (uid, id, updates) => {
  await updateDoc(doc(db, "users", uid, "menuItems", id), updates);
};

// DELETE
export const deleteMenuItem = async (uid, id) => {
  await deleteDoc(doc(db, "users", uid, "menuItems", id));
};
