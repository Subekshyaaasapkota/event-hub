// src/hooks/useAdmin.jsx
import { useCallback } from "react";
import {
  fetchAdminEvents,
  setAdminEventVerification,
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
  //  Takes an optional filter object, e.g. { verificationStatus: "pending" }.
  const fetchEvents = useCallback((filters) => {
  dispatch(fetchAdminEvents(filters));
  }, [dispatch]);

  //  Approve / Reject Event
  //  unwrap, so the page can await this and tell a real approval from a failure
  //  and report the server's reason. Without it the promise always resolves and
  //  an admin sees "approved" for a decision that was refused.
  const setEventVerification = useCallback(
  (eventId, decision, note) =>
    dispatch(
      setAdminEventVerification({ eventId, decision, note }),
    ).unwrap(),
  [dispatch],
  );

  //  Users
  const fetchUsers = useCallback(() => {
  dispatch(fetchAllUsers());
  }, [dispatch]);

  //  Clubs
  const fetchClubs = useCallback(async () => {
  // Rethrows instead of swallowing. It used to catch and log only, so a failed
  // load left the caller with a resolved promise and the page rendered an empty
  // club list as though that were the real answer.
  await dispatch(fetchAdminClubs()).unwrap();
  }, [dispatch]);

  //  Approve Club
  //  Refetches, and this was missing. rejectClub below did refetch, so approving
  //  left the card showing "Pending" with its Approve and Reject buttons still
  //  live until the page was reloaded, while rejecting updated immediately.
  const approveClub = useCallback(
  (clubId) => dispatch(adminApproveClub(clubId)).unwrap().then(fetchClubs),
  [dispatch, fetchClubs],
  );

  //  Reject Club
  const rejectClub = useCallback(
  (clubId) => dispatch(rejectClubAdmin(clubId)).unwrap().then(fetchClubs),
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
    setEventVerification,
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
