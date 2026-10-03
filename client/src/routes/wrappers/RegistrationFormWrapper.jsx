import { useParams, useNavigate } from "react-router-dom";
import RegistrationForm from "../../pages/public/RegistrationForm";

const RegistrationFormWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
  <RegistrationForm
  eventId={id}
  //  onClose={() => navigate(-1) || navigate("/")}
  onClose={() => {
  if (window.history.length > 1) {
  navigate(-1);
  } else {
  navigate("/");
  }
  }}
  onSuccess={() => navigate("/dashboard")}
  />
  );
};

export default RegistrationFormWrapper;
