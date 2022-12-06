import { Action, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { createStateSyncMiddleware } from "redux-state-sync";
import { persistStore, persistReducer } from "redux-persist";
import sagas from "./sagas";
import reducers from "./reducers";
import localStorage from "redux-persist/lib/storage";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { checkCookie, getAppEnv, getAppName } from "../shared/helpers";
import usersSlice from "./common/reducers/UsersSlice";

const persistConfig = {
  key: `${getAppName()}${getAppEnv()}` || "ChatOwn",
  whitelist: checkCookie() ? [usersSlice.name] : [],
  storage: localStorage,
  version: 1,
  transforms: [
    encryptTransform({
      secretKey: import.meta.env.VITE_ENCRYPTION_KEY as string,
    }),
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const stateSyncConfig = {
  channel: `${getAppName()}${getAppEnv()}` || "ChatOwn",
  predicate: (action: Action) => {
    // return true;
    var [main, second] = action.type?.split("/");
    const whitelistStartWords = ["setUsersDetails"];
    if (whitelistStartWords?.includes(second)) {
      return true;
    }
    return false;
  },
};

let sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [sagaMiddleware, createStateSyncMiddleware(stateSyncConfig)],
});

export const persistor = persistStore(store);

sagaMiddleware.run(sagas);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const dispatchFromFunction = (action: Action) => store.dispatch(action);

export const selectFromFunction = (selector: (state: RootState) => any) => {
  return selector(store.getState());
};
