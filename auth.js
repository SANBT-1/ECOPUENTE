// auth.js - Firebase Auth + roles (administrador / usuario)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1) PEGA AQUÍ la config de tu proyecto (Firebase Console > Configuración del proyecto > Tus apps > Web)
const firebaseConfig = {
  apiKey: "AIzaSyAKzSBprfLFUsliuLFnBimdslL2d1B31U0",
  authDomain: "ecopuente-c492f.firebaseapp.com",
  projectId: "ecopuente-c492f",
  storageBucket: "ecopuente-c492f.firebasestorage.app",
  messagingSenderId: "422085759679",
  appId: "1:422085759679:web:b6ca58fb2bfa46fe586c0a"
};

// El rol lo elige la persona al registrarse; "administrador" exige un código secreto (se valida en las reglas de Firestore)

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const google = new GoogleAuthProvider();

// Devuelve "administrador" o "usuario"; crea el registro la primera vez
export async function obtenerRol(user) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().rol;
  const quiere = sessionStorage.getItem("rolElegido") === "administrador";
  const codigo = sessionStorage.getItem("codigoAdmin") || "";
  const base = { nombre: user.displayName || "", email: user.email, creado: serverTimestamp() };
  let rol = "usuario";
  if (quiere) {
    try {
      await setDoc(ref, { ...base, rol: "administrador", codigoAdmin: codigo });
      rol = "administrador";
    } catch (e) { sessionStorage.setItem("codigoMalo", "1"); } // código incorrecto: Firestore lo rechaza
  }
  if (rol === "usuario") await setDoc(ref, { ...base, rol: "usuario" });
  sessionStorage.removeItem("codigoAdmin");
  return rol;
}

export const entrarConGoogle = () => signInWithPopup(auth, google); // inicia sesión o registra solo
export const entrarConCorreo = (e, p) => signInWithEmailAndPassword(auth, e, p);
export async function registrarConCorreo(nombre, e, p) {
  const cred = await createUserWithEmailAndPassword(auth, e, p);
  await updateProfile(cred.user, { displayName: nombre });
  return cred;
}
export const cerrarSesion = () => signOut(auth);
export { onAuthStateChanged };