import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import React from 'react'
import Image from "next/image";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function HeaderLeft() {
  return (
    <div className="flex items-center gap-3">
        {/* Sidebar Toggle and Calendar Icon */}
      <div className="hidden items-center lg:flex">
      <Button
          variant="ghost"
          className="rounded-full p-2">
            <Menu className="size-6" />
      </Button>
      <Image src="/calendar_1_2x.png" width={40} height={40} alt="icon" />
        <h1 className="text-xl">Calendar</h1>
      </div>
       {/* Today Button */}
       <Button variant="outline">
        Today
      </Button>
      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <MdKeyboardArrowLeft
          className="size-6 cursor-pointer font-bold"
        />
        <MdKeyboardArrowRight
          className="size-6 cursor-pointer font-bold"
        />
      </div>
      {/* Current Month and Year Display */}
      <h1 className="hidden text-xl lg:block">
       April 8
      </h1>
    </div>
  )
}

