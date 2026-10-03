import { createSlice } from "@reduxjs/toolkit";
import {
  registerClub,
  fetchOrganizerEvents,
  deleteOrganizerEvent,
  fetchClubRegistrations,
} from "./organizerAction";

const organizerSlice = createSlice({
  name: "organizer",
  initialState: {
  club: null,
  orgEvents: [],
  registrations: [],
  loading: false,
  error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
  builder
  .addCase(registerClub.pending, (state) => {
  state.loading = true;
  state.error = null;
  state.club = null;
  })
  .addCase(registerClub.fulfilled, (state, action) => {
  state.loading = false;
  state.club = action.payload;
  state.error = null;
  })
  .addCase(registerClub.rejected, (state, action) => {
  state.loading = false;
  state.club = null;
  state.error = action.payload;
  })
  .addCase(fetchOrganizerEvents.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
  state.loading = false;
  state.orgEvents = action.payload;
  })
  .addCase(fetchOrganizerEvents.rejected, (state, action) => {
  state.loading = false;
  state.orgEvents = [];
  state.error = action.payload;
  })
  .addCase(deleteOrganizerEvent.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(deleteOrganizerEvent.fulfilled, (state, action) => {
  state.loading = false;
  // Fixed: Compare with _id instead of id (based on your component using event._id)
  state.orgEvents = state.orgEvents.filter(
  (event) => event._id !== action.payload,
  );
  state.error = null;
  })
  .addCase(deleteOrganizerEvent.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(fetchClubRegistrations.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchClubRegistrations.fulfilled, (state, action) => {
  state.loading = false;
  state.registrations = action.payload;
  })
  .addCase(fetchClubRegistrations.rejected, (state, action) => {
  state.loading = false;
  state.registrations = [];
  state.error = action.payload;
  });
  },
});

export default organizerSlice.reducer;
