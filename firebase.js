import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDAhYlyUV1n4ZUkEZrTgeeVlmDL9jvAhZ4",
  authDomain: "dev-blog-e4d2d.firebaseapp.com",
  projectId: "dev-blog-e4d2d",
  storageBucket: "dev-blog-e4d2d.appspot.com",
  messagingSenderId: "30990206536",
  appId: "1:30990206536:web:fca08d156be73c52effa7d",
  measurementId: "G-S3P3RVQC3Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Firestore
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

// get all blogs
export async function getBlogs(db) {
  const blogsCol = collection(db, "blogs");
  const blogsSnapshot = await getDocs(blogsCol);
  const blogsList = blogsSnapshot.docs.map((doc) => doc.data());
  return blogsList.reverse();
}

// get one blog
export async function getSpecificBlog(db, id) {
  const blogRef = doc(db, "blogs", id);
  const blogSnap = await getDoc(blogRef);
  const blogResult = blogSnap.data();

  return blogResult;
}

export function writeBlog(blogObj) {
  const db = getDatabase();
  set(ref(db, "blogs/" + blogObj.id), {
    title: blogObj.title,
    content: blogObj.content,
    date_posted: blogObj.date_posted,
  });
}

// Proper signInWithGoogle
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// Sign in with email and password
const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// Register new user
const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// Password reset via email
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

// Logout
const logout = () => {
  signOut(auth);
};

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
};