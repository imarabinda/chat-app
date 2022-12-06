import { FC, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { auth, firestore } from "./shared/firebase";
import { doc, setDoc } from "firebase/firestore";

import BarWave from "react-cssfx-loading/src/BarWave";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import SignIn from "./pages/SignIn";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  setCurrentUser,
  UsersSliceStateType,
} from "./redux/common/reducers/UsersSlice";
import { FIRESTORE_USERS_COLLECTION } from "./shared/constants";
import { establishSocketConnection } from "./shared/helpers";

const App: FC = () => {
  const { currentUser } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const userData = {
  //         uid: user.uid,
  //         email: user.email,
  //         displayName: user.displayName,
  //         photoURL: user.photoURL,
  //         isSiteAdmin: false,
  //       };
  //       dispatch(setCurrentUser(userData));
  //       setDoc(doc(firestore, FIRESTORE_USERS_COLLECTION, user.uid), userData);
  //     } else dispatch(setCurrentUser(null));
  //   });
  // }, []);

  useEffect(() => {
    let connection = establishSocketConnection();
    return connection;
  }, [currentUser?.uid]);

  if (typeof currentUser === "undefined")
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BarWave />
      </div>
    );

  return (
    <Routes>
      <Route
        index
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="sign-in" element={<SignIn />} />
      <Route
        path=":id"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
