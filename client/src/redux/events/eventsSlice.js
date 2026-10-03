import { createSlice } from "@reduxjs/toolkit";
import {
  fetchEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  fetchMyRegistrations,
  fetchRecommendedEvents,
} from "./eventsAction";

const eventsSlice = createSlice({
  name: "events",
  initialState: {
  events: [],
  myRegistrations: [],
  recommendedEvents: [],
  selectedEvent: null, // for getEventById
  loading: false,
  error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
  builder
  .addCase(fetchEvents.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchEvents.fulfilled, (state, action) => {
  state.loading = false;
  state.events = action.payload;
  })
  .addCase(fetchEvents.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(getEventById.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(getEventById.fulfilled, (state, action) => {
  state.loading = false;
  state.selectedEvent = action.payload; // single event, not the list
  })
  .addCase(getEventById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(createEvent.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(createEvent.fulfilled, (state, action) => {
  state.loading = false;
  state.events.unshift(action.payload);
  })
  .addCase(createEvent.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(updateEvent.fulfilled, (state, action) => {
  const updated = action.payload;
  state.events = state.events.map((item) =>
  (item._id || item.id) === (updated._id || updated.id) ? updated : item
  );
  })
  .addCase(deleteEvent.fulfilled, (state, action) => {
  state.events = state.events.filter(
  (item) => (item._id || item.id) !== action.payload
  );
  })
  .addCase(registerForEvent.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(registerForEvent.fulfilled, (state) => {
  state.loading = false;
  state.error = null;
  })
  .addCase(registerForEvent.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(fetchMyRegistrations.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
  state.loading = false;
  state.myRegistrations = action.payload;
  })
  .addCase(fetchMyRegistrations.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  })
  .addCase(fetchRecommendedEvents.pending, (state) => {
  state.loading = true;
  state.error = null;
  })
  .addCase(fetchRecommendedEvents.fulfilled, (state, action) => {
  state.loading = false;
  state.recommendedEvents = action.payload;
  })
  .addCase(fetchRecommendedEvents.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
  });
  },
});

export default eventsSlice.reducer;