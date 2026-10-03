import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  fetchMe,
  updateUserProfile,
} from "./authAction";

const initialState = {
  user: null, // Populated by fetchMe / login / register
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("authToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  logout(state) {
  state.user = null;
  state.error = null;
  state.loading = false;
  state.isAuthenticated = false;
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  },
  },
  extraReducers: (builder) => {
  builder
  .addCase(registerUser.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(registerUser.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
  state.isAuthenticated = true;
  state.error = null;
  })
  .addCase(registerUser.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(loginUser.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(loginUser.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
  state.isAuthenticated = true;
  state.error = null;
  })
  .addCase(loginUser.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  state.isAuthenticated = false;
  })
  .addCase(fetchMe.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchMe.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
  state.isAuthenticated = true;
  state.error = null;
  })
  .addCase(fetchMe.rejected, (state) => {
  state.loading = false;
  state.user = null;
  state.error = null;
  state.isAuthenticated = false;
  localStorage.removeItem("authToken");
  })
  .addCase(updateUserProfile.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(updateUserProfile.fulfilled, (state, action) => {
  state.loading = false;
  state.user = action.payload;
  state.error = null;
  })
  .addCase(updateUserProfile.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
