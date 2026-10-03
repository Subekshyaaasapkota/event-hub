import { useDispatch, useSelector } from "react-redux";
import {

  fetchOrganizerEvents,
  deleteOrganizerEvent,
  fetchClubRegistrations,
} from "../redux/organizer/organizerAction";
import clubService from "../services/clubService";
import { useCallback } from "react";
// import { registerClub } from "../redux/organizer/organizerAction";
const useOrganizer = () => {
  const dispatch = useDispatch();
  const orgEvents = useSelector((state) => state.organizer);

  const clubRegister = useCallback(
  async (clubData) => {
  try {
  console.log("Club Data going from hook");
  const result = await clubService.registerClub(clubData);
  console.log("Club Data coming from service =>", result);
  return { success: true, data: result };
  } catch (err) {
  console.log("Club Data coming from service =>", err);
  console.log("Club Data coming from service =>", err.message);
  console.log("Club Data coming from service =>", err.response?.data);
  console.log("Club Data coming from service =>", err.response?.data?.message);
  console.log("Club Data coming from service =>", err.response?.data?.error);
  console.log("Club Data coming from service =>", err.response?.data?.errors);
  return { success: false, message: err.message || "Something went wrong" };
  }
  },
  [],
  );

  // Memoize the fetch function to prevent recreation on every render
  const fetchClubEvents = useCallback(() => {
  return dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  const deleteEvent = useCallback(
  (id) => {
  return dispatch(deleteOrganizerEvent(id));
  },
  [dispatch],
  );

  const fetchRegistrations = useCallback(() => {
  return dispatch(fetchClubRegistrations());
  }, [dispatch]);

  return {
  clubRegister,
  fetchOrganizerEvents: fetchClubEvents,
  deleteOrganizerEvent: deleteEvent,
  fetchClubRegistrations: fetchRegistrations,
  updateGoogleSheetLink: useCallback(async (eventId, link) => {
  try {
  const result = await clubService.updateGoogleSheetLink(eventId, link);
  return { success: true, data: result };
  } catch (err) {
  return { success: false, message: err.message };
  }
  }, []),
  ...orgEvents,
  };
};
export default useOrganizer;
