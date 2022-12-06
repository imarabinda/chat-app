import { enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence, getFirestore } from "firebase/firestore";

import configs from "./configs";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { checkCookie } from "./helpers";
import { getDatabase } from "firebase/database";


const firebaseApp = initializeApp(JSON.parse(configs.firebaseConfig));

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const database = getDatabase(firebaseApp);
if (checkCookie()) {
  // enableIndexedDbPersistence(firestore, { forceOwnership: false });
  enableMultiTabIndexedDbPersistence(firestore); //multi index firestore enabled.
}

