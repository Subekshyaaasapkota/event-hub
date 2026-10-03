import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import useAuth from "./hooks/useAuth";
import Navbar from "./components/common/Navbar";
import ErrorBoundary from "./components/common/ErrorBoundary";

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
  <ErrorBoundary>
  <AppRoutes />
  </ErrorBoundary>
  <Toaster />
  </div>
  );
};

export default App;
