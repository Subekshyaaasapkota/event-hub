import React from 'react'
import Navbar from '../common/Navbar'
import { Outlet } from 'react-router-dom'
import useEvents from '../../hooks/useEvents';
import FloatingCalendar from '../common/FloatingCalendar';

const MainLayout = () => {
  const { events } = useEvents();
  return (
  <>
  <FloatingCalendar events={events} />
  <Navbar />
  <Outlet />
  </>
  )
}

export default MainLayout
