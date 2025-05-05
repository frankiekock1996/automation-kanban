import { Input } from "@/components/ui/input";
import { HiOutlineUsers } from "react-icons/hi";


export default function SearchUsers() {
  return (
    <div className="relative ">
      <HiOutlineUsers className="absolute left-2.5 top-3 h-4 w-4 text-slate-600" />
      <Input
        type="search"
        placeholder="Search for people"
        className="w-full rounded-lg pl-7 bg-slate-100 placeholder:text-slate-600 border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0"
      />
    </div>
  )
}