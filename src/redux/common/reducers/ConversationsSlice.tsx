import { createReducer, createSlice } from "@reduxjs/toolkit";

export type ConversationsSliceStateType = {
  listeners: {
    [key: string]: {
      lastSeen: number;
      status: "offline" | "disconnected" | "online";
      isTyping: {
        [key: string]: boolean;
      };
    };
  };
};
const initialState: ConversationsSliceStateType = {
  listeners: {},
};
export const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    UpdateListeners: (state, { payload }) => {
      state.listeners[payload?.id] = payload?.data;
    },
  },
});

export const { UpdateListeners } = conversationsSlice.actions;
export default conversationsSlice;
