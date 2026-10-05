// src/hooks/useAdmin.jsx
import { useCallback } from "react";
import {
  fetchAdminEvents,
  fetchAllUsers,
  fetchAdminClubs,
  adminApproveClub,
  rejectClubAdmin,
  deleteUserAdmin,
  deleteAdminEvent,
  fetchAllRegistrations,
} from "../redux/admin/adminAction.js";
import { useDispatch, useSelector } from "react-redux";

const useAdmin = () => {
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.admin);

  //  Events
  const fetchEvents = useCallback(() => {
  dispatch(fetchAdminEvents());
  }, [dispatch]);

  //  Users
  const fetchUsers = useCallback(() => {
  dispatch(fetchAllUsers());
  }, [dispatch]);

  //  Clubs
  const fetchClubs = useCallback(async () => {
  try {
  await dispatch(fetchAdminClubs()).unwrap();
  } catch (error) {
  console.error("Failed to fetch clubs:", error);
  }
  }, [dispatch]);

  //  Approve Club
  const approveClub = useCallback(
  async (clubId) => {
  try {
  await dispatch(adminApproveClub(clubId)).unwrap();
  // Refresh the list after approval
  } catch (error) {
  console.error("Failed to approve club:", error);
  throw error;
  }
  },
  [dispatch],
  );

  //  Reject Club - Add this endpoint in backend
  const rejectClub = useCallback(
  async (clubId) => {
  try {
  await dispatch(rejectClubAdmin(clubId)).unwrap();
  await fetchClubs(); // Refresh the list after rejection
  } catch (error) {
  console.error("Failed to reject club:", error);
  throw error;
  }
  },
  [dispatch, fetchClubs],
  );

  //  Delete User
  //  Returns the dispatch promise, matching deleteEvent below. Without it this
  //  returned undefined, so a caller that awaited it could not tell a completed
  //  delete from a rejected one and reported success either way.
  const deleteUser = useCallback(
  (id) => dispatch(deleteUserAdmin(id)).unwrap(),
  [dispatch],
  );

//  Delete Event
  //  Returns the promise from unwrap so a caller can tell success from failure.
  //  The console shows a confirmation before deleting, and it has to be able to
  //  report the server refusing rather than assuming the row is gone. The event
  //  list drops the row in the slice, so there is no refetch here.
  const deleteEvent = useCallback(
  (eventId) => dispatch(deleteAdminEvent(eventId)).unwrap(),
  [dispatch],
  );

  //  Registrations
  const fetchRegistrations = useCallback(() => {
  dispatch(fetchAllRegistrations());
  }, [dispatch]);

  return {
    fetchEvents,
    fetchUsers,
    fetchClubs,
    approveClub,
    rejectClub,
    deleteUser,
    deleteEvent,
    fetchRegistrations,
  users: adminState.users || [],
  registrations: adminState.registrations || [],
  loading: adminState.loading,
  error: adminState.error,
  adminData: adminState,
  };
};

export default useAdmin;
