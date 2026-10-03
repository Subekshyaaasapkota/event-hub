import axios from "axios";

export const khaltiPayment = async (payload) => {
  const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
  const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2/epayment";

  const response = await axios.post(
  `${KHALTI_BASE_URL}/initiate/`,
  payload,
  {
  headers: {
  Authorization: `Key ${KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
  },
  }
  );
  console.log("Khalti Payment Response =", response.data);
  return response.data;
};

export const khaltiLookup = async (pidx) => {
  const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
  const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2/epayment";

  const response = await axios.post(
  `${KHALTI_BASE_URL}/lookup/`,
  { pidx },
  {
  headers: {
  Authorization: `Key ${KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
  },
  }
  );
  return response.data;
};
