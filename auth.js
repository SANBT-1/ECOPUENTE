import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyAKzSBprfLFUsliuLFnBimdslL2d1B31U0",
  authDomain: "ecopuente-c492f.firebaseapp.com",
  projectId: "ecopuente-c492f",
  storageBucket: "ecopuente-c492f.firebasestorage.app",
  messagingSenderId: "422085759679",
  appId: "1:422085759679:web:b6ca58fb2bfa46fe586c0a"
});
export const auth = getAuth(app), db = getFirestore(app);

export async function obtenerRol(user) {
  const ref = doc(db, "usuarios", user.uid), snap = await getDoc(ref);
  if (snap.exists()) return snap.data().rol;
  const base = { nombre: user.displayName || "", email: user.email, creado: serverTimestamp() };
  let rol = "usuario";
  if (sessionStorage.getItem("rolElegido") === "administrador") try {
    await setDoc(ref, { ...base, rol: "administrador", codigoAdmin: sessionStorage.getItem("codigoAdmin") || "" });
    rol = "administrador";
  } catch { sessionStorage.setItem("codigoMalo", "1"); }
  if (rol === "usuario") await setDoc(ref, { ...base, rol });
  sessionStorage.removeItem("codigoAdmin");
  return rol;
}

export const entrarConGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const entrarConCorreo = (e, p) => signInWithEmailAndPassword(auth, e, p);
export async function registrarConCorreo(nombre, e, p) {
  const cred = await createUserWithEmailAndPassword(auth, e, p);
  await updateProfile(cred.user, { displayName: nombre });
  return cred;
}
export const cerrarSesion = () => signOut(auth);
export { onAuthStateChanged };
