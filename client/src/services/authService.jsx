import api, { getApiErrorMessage } from "../api/axios";

// api => url/...
const authService = {
  /**
  *  Login User Entity
  * Authenticates a user against central data and provisions a secure session.
  */
  login: async (loginData) => {
  try {
  const response = await api.post("/api/auth/login", loginData);
  if (response.data?.token) {
  localStorage.setItem("authToken", response.data.token);
  }
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Login failure"));
  }
  },

  /**
  *  Register New Entity
  * Submits a registration request for a fresh user profile.
  */
  register: async (userData) => {
  try {
  const response = await api.post("/api/auth/register", userData);
  if (response.data?.token) {
  localStorage.setItem("authToken", response.data.token);
  }
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Signup failed"));
  }
  },

  getMe: async () => {
  try {
  const response = await api.get("/api/auth/me");
if (response.data?.token) {
      localStorage.setItem("authToken", response.data.token);
    }
  return response.data;
  } catch (error) {
  throw new Error(
  getApiErrorMessage(error, "Identity verification failure"),
  );
  }
  },

  /**
  *  Update Profile Entity
  * Modifies the user profile metadata including profile picture upload.
  */
  updateProfile: async (formData) => {
  try {
  const response = await api.put("/api/auth/profile", formData, {
  headers: {
  "Content-Type": "multipart/form-data",
  },
  });
  return response.data;
  } catch (error) {
  throw new Error(getApiErrorMessage(error, "Profile update failed"));
  }
  },

  /**
  *  Terminate Session
  * Clears the httpOnly cookie on the server and the token in local storage.
  */
  logout: async () => {
  try {
  await api.post("/api/auth/logout");
  } catch {
  // Logging out locally must succeed even if the server is unreachable
  } finally {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  }
  },
};

export default authService;