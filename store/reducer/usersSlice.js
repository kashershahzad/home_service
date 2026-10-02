import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    userData: {},
    location: {},
  },
  reducers: {
    setUserData(state, action) {
      const payload = action.payload || {};
      const prev = state.userData || {};
      state.userData = {
        ...prev,
        ...payload,
        id: payload.id || payload._id || prev.id || null,
        // keep existing name if API user has no name yet
        fullName: payload.fullName || prev.fullName || "",
        nickname: payload.nickname || prev.nickname || "",
        email: payload.email || prev.email || "",
        address: payload.address || prev.address || "",
        profileImageUrl:
          payload.profileImageUrl !== undefined
            ? payload.profileImageUrl
            : prev.profileImageUrl,
      };
    },
    clearUserData(state) {
      state.userData = {};
    },
    setLocation(state, action) {
      state.location = action.payload;
    },
  },
});

export const { setUserData, clearUserData, setLocation } = usersSlice.actions;

export default usersSlice.reducer;
