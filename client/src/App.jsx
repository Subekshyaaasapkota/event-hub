import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import useAuth from "./hooks/useAuth";
import Navbar from "./components/common/Navbar";

const App = () => {
  const { getMe } = useAuth();

  useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
  getMe();
  }
  }, [getMe]);

  return (
  <div>
  {/* <Navbar/> */}
  <AppRoutes />
  <Toaster />
  </div>
  );
};

export default App;
