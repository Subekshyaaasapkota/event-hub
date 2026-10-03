import { useState, useCallback } from "react";
import paymentService from "../services/paymentService";

const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
  *  KHALTI METHODS
  */
  const initiateKhalti = useCallback(async (paymentData) => {
  setLoading(true);
  setError(null);
  try {
  const res = await paymentService.initiateKhalti(paymentData);
  return { success: true, ...res };
  } catch (err) {
  setError(err.message);
  return { success: false, message: err.message };
  } finally {
  setLoading(false);
  }
  }, []);

  const verifyKhalti = useCallback(async (pidx) => {
  setLoading(true);
  setError(null);
  try {
  const res = await paymentService.verifyKhalti(pidx);
  return { success: true, ...res };
  } catch (err) {
  setError(err.message);
  return { success: false, message: err.message };
  } finally {
  setLoading(false);
  }
  }, []);

  /**
  *  ESEWA METHODS
  */
  const getEsewaForm = useCallback(async (registrationId, amount) => {
  setLoading(true);
  setError(null);
  try {
  const res = await paymentService.getEsewaForm(registrationId, amount);
  return { success: true, ...res };
  } catch (err) {
  setError(err.message);
  return { success: false, message: err.message };
  } finally {
  setLoading(false);
  }
  }, []);

  const verifyEsewa = useCallback(async (verifyData) => {
  setLoading(true);
  setError(null);
  try {
  const res = await paymentService.verifyEsewa(verifyData);
  return { success: true, ...res };
  } catch (err) {
  setError(err.message);
  return { success: false, message: err.message };
  } finally {
  setLoading(false);
  }
  }, []);

  const reset = () => {
  setLoading(false);
  setError(null);
  };

  return {
  initiateKhalti,
  verifyKhalti,
  getEsewaForm,
  verifyEsewa,
  reset,
  loading,
  error,
  };
};

export default usePayment;
