import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authSlice.js";
import authService from "../services/authService";
import { fetchMe, loginUser, registerUser, updateUserProfile } from "../redux/auth/authAction.js";

const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const signup = useCallback(
  async (formData) => {
  try {
  const result = await dispatch(registerUser(formData)).unwrap();
  return { success: true, data: result };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const updateProfile = useCallback(
  async (formData) => {
  try {
  const result = await dispatch(updateUserProfile(formData)).unwrap();
  return { success: true, data: result };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const login = useCallback(
  async (data) => {
  try {
  const result = await dispatch(loginUser(data)).unwrap();
  return { success: true, data: result };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const getMe = useCallback(async () => {
  try {
  // Correct: .unwrap() goes AFTER the dispatch
  const result = await dispatch(fetchMe()).unwrap();
  return { success: true, data: result };
  } catch (err) {
  return { success: false, message: err };
  }
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
  // Clear the server-side cookie first, then the local session
  await authService.logout();
  dispatch(logout());
  }, [dispatch]);

  return {
  login,
  logout: logoutUser,
  getMe,
  signup,
  updateProfile,
  ...auth,
  };
};
export default useAuth;
