import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
  try {
  return await authService.getMe();
  } catch (error) {
  return rejectWithValue(error.message || "Session expired");
  }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
  try {
  const response = await authService.login(data);
  return response;
  } catch (error) {
  return rejectWithValue(error.message || "Login failed");
  }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
  try {
  const response = await authService.register(data);
  return response;
  } catch (error) {
  return rejectWithValue(error.message || "Registration failed");
  }
  },
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
  try {
  const response = await authService.updateProfile(formData);
  return response.user; // Return the updated user object
  } catch (error) {
  return rejectWithValue(error.message || "Profile update failed");
  }
  },
);
