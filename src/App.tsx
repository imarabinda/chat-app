import { FC, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { auth, firestore } from "./shared/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import BarWave from "react-cssfx-loading/src/BarWave";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import SignIn from "./pages/SignIn";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import {
  setCurrentUser,
  setCurrentUserId,
  UsersSliceStateType,
} from "./redux/common/reducers/UsersSlice";
import { FIRESTORE_USERS_COLLECTION } from "./shared/constants";
import { establishSocketConnection } from "./shared/helpers";

const App: FC = () => {
  const { currentUser, currentUserId } = useAppSelector<UsersSliceStateType>(
    (state) => state.users
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (result) => {
      if (result?.uid) {
        dispatch(setCurrentUserId(result?.uid));
      } else {
        dispatch(setCurrentUserId(null));
      }
    });
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (currentUserId) {
      const q = query(
        collection(firestore, FIRESTORE_USERS_COLLECTION),
        where("uid", "==", currentUserId)
      );
      unsubscribe = onSnapshot(q, (snapShot) => {
        if (!snapShot?.empty) {
          dispatch(setCurrentUser(snapShot?.docs?.[0]?.data?.()));
        }
      });
    } else {
      dispatch(setCurrentUser(null));
    }
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    let connection = establishSocketConnection();
    return connection;
  }, [currentUserId]);

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
