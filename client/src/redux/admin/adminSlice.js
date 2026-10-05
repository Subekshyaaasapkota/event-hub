// src/redux/admin/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminEvents,
  fetchAllUsers,
  fetchAdminClubs,
  adminApproveClub,
  rejectClubAdmin,
  deleteUserAdmin,
  deleteAdminEvent,
  fetchAllRegistrations,
} from "./adminAction.js";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
  events: [],
  users: [],
  clubs: [],
  registrations: [],
  loading: false,
  error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
  builder
  // Fetch Events
  .addCase(fetchAdminEvents.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchAdminEvents.fulfilled, (state, action) => {
  state.loading = false;
  state.events = action.payload;
  })
  .addCase(fetchAdminEvents.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Delete Event. Filtered out of the list the admin is looking at rather than
  // refetching, so the row disappears the moment the server confirms.
  .addCase(deleteAdminEvent.fulfilled, (state, action) => {
  state.events = state.events.filter((e) => e._id !== action.payload);
  })

  // Fetch Users
  .addCase(fetchAllUsers.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchAllUsers.fulfilled, (state, action) => {
  state.loading = false;
  state.users = action.payload;
  })
  .addCase(fetchAllUsers.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Fetch Clubs
  .addCase(fetchAdminClubs.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchAdminClubs.fulfilled, (state, action) => {
  state.loading = false;
  state.clubs = action.payload;
  })
  .addCase(fetchAdminClubs.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Approve Club
  .addCase(adminApproveClub.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(adminApproveClub.fulfilled, (state) => {
  state.loading = false;
  })
  .addCase(adminApproveClub.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Reject Club
  .addCase(rejectClubAdmin.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(rejectClubAdmin.fulfilled, (state) => {
  state.loading = false;
  })
  .addCase(rejectClubAdmin.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Delete User (new)
  .addCase(deleteUserAdmin.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(deleteUserAdmin.fulfilled, (state) => {
  state.loading = false;
  })
  .addCase(deleteUserAdmin.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })

  // Fetch Registrations
  .addCase(fetchAllRegistrations.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchAllRegistrations.fulfilled, (state, action) => {
  state.loading = false;
  state.registrations = action.payload;
  })
  .addCase(fetchAllRegistrations.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  });
  },
});

export default adminSlice.reducer;
