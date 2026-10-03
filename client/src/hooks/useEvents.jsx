import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
  registerForEvent as registerAction,
  fetchMyRegistrations as fetchMyRegistrationsAction,
  fetchRecommendedEvents as fetchRecommendedEventsAction,
} from "../redux/events/eventsAction.js";

const useEvents = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const selectedEvent = useSelector((state) => state.events.selectedEvent);
  const myRegistrations = useSelector((state) => state.events.myRegistrations);
  const recommendedEvents = useSelector((state) => state.events.recommendedEvents);
  const loading = useSelector((state) => state.events.loading);
  const error = useSelector((state) => state.events.error);

  const fetchAllEvents = useCallback(async (params = {}) => {
  try {
  const res = await dispatch(fetchEvents(params)).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  }, [dispatch]);

  const fetchEventById = useCallback(
  async (id) => {
  try {
  const res = await dispatch(getEventById(id)).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const createNewEvent = useCallback(
  async (data) => {
  try {
  const res = await dispatch(createEvent(data)).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const updateExistingEvent = useCallback(
  async (payload) => {
  try {
  const res = await dispatch(updateEvent(payload)).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const deleteExistingEvent = useCallback(
  async (id) => {
  try {
  await dispatch(deleteEvent(id)).unwrap();
  return { success: true };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const registerForEvent = useCallback(
  async (eventId, formData) => {
  try {
  const res = await dispatch(registerAction({ eventId, formData })).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const fetchMyRegistrations = useCallback(
  async () => {
  try {
  const res = await dispatch(fetchMyRegistrationsAction()).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  const fetchRecommendedEvents = useCallback(
  async () => {
  try {
  const res = await dispatch(fetchRecommendedEventsAction()).unwrap();
  return { success: true, data: res };
  } catch (err) {
  return { success: false, message: err };
  }
  },
  [dispatch],
  );

  return {
  fetchEvents: fetchAllEvents,
  fetchEventById,
  createEvent: createNewEvent,
  updateEvent: updateExistingEvent,
  deleteEvent: deleteExistingEvent,
  registerForEvent,
  fetchMyRegistrations,
  fetchRecommendedEvents,
  events,
  selectedEvent,
  myRegistrations,
  recommendedEvents,
  loading,
  error,
  };
};

export default useEvents;
