import { cn } from '@/lib/utils'
import React from 'react'
import Create from './create'
import SideBarCalendar from './side-bar-calendar'
import SearchUsers from './search-users'
import MyCalendars from './my-calendar'

export default function SideBar() {
  return (
    <aside
      className={cn(
        "w-92 hidden border-t px-2 py-3 transition-all duration-300 ease-in-out lg:block"
      )}
    >
      <Create/>
      <SideBarCalendar/>
      <SearchUsers/>
      {/* <MyCalendars/> */}
    </aside>
  )
}