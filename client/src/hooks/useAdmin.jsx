// src/hooks/useAdmin.jsx
import { useCallback } from "react";
import {
  fetchAdminEvents,
  fetchAllUsers,
  fetchAdminClubs,
  adminApproveClub,
  rejectClubAdmin,
  deleteUserAdmin,
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
  const deleteUser = useCallback(
  (id) => {
  dispatch(deleteUserAdmin(id));
  },
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
  fetchRegistrations,
  users: adminState.users || [],
  registrations: adminState.registrations || [],
  loading: adminState.loading,
  error: adminState.error,
  adminData: adminState,
  };
};

export default useAdmin;
