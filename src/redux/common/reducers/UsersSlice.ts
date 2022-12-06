import { createSlice } from "@reduxjs/toolkit";
import { UserData } from "../../../shared/types";

export type UsersSliceStateType = {
  currentUser: null | UserData;
};
const initialState: UsersSliceStateType = {
  currentUser: null,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }) => {
      state.currentUser = payload;
    },
  },
});
export const { setCurrentUser } = usersSlice.actions;
export default usersSlice;
