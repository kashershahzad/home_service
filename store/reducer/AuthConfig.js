import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  isOnBoarding: false,
};

export const authConfigsSlice = createSlice({
  name: "authConfigs",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setOnBoarding(state, action) {
      state.isOnBoarding = action.payload;
    },
    logout(state) {
      state.token = "";
    },
  },
});

export const { setToken, setOnBoarding, logout } = authConfigsSlice.actions;

export default authConfigsSlice.reducer;
