import { createSlice } from "@reduxjs/toolkit";
import { UserData } from "../../../shared/types";

export type UsersSliceStateType = {
  currentUser: null | UserData;
  currentUserId: null | string;
};
const initialState: UsersSliceStateType = {
  currentUser: null,
  currentUserId:null,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }) => {
      state.currentUser = payload;
    },
    setCurrentUserId: (state, { payload }) => {
      state.currentUserId = payload;
    },
  },
});
export const { setCurrentUser, setCurrentUserId } = usersSlice.actions;
export default usersSlice;
