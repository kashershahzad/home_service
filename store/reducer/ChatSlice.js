import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messagesData: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessagesData(state, action) {
      state.messagesData = action.payload || [];
    },
    paginatedData(state, action) {
      state.messagesData = [...state.messagesData, ...(action.payload || [])];
    },
    receivedMessage(state, action) {
      const { message } = action.payload || {};
      if (!message) return;
      const exists = state.messagesData.some((m) => m._id === message._id);
      if (!exists) {
        state.messagesData = [message, ...state.messagesData];
      }
    },
  },
});

export const { setMessagesData, paginatedData, receivedMessage } =
  chatSlice.actions;

export default chatSlice.reducer;
