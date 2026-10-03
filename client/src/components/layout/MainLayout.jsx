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
    {/* The mobile tab bar is fixed to the bottom of the viewport, so without
        this the last of every page's footer sits underneath it. A spacer here
        rather than padding on each page keeps it to one change. */}
    <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    </>
  )
}

export default MainLayout
