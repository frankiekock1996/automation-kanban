import React from 'react'
import DashboardCard from './DashboardCard'
import { Folder, MessageCircle, Newspaper, User, FolderX, FolderCheck } from 'lucide-react';

import AnalyticsChart from './AnalyticsChart';
import PostsTable from '@/components/posts/PostsTable';
import PostsPagination from '@/components/posts/PostPagination';


export default function Home() {
  return (
    <>
      <div className='flex flex-col md:flex-row justify-between gap-5 mb-5'>
        <DashboardCard
          title='Unit built'
          count={100}
          icon={<Newspaper className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Categories'
          count={12}
          icon={<User className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Unit passed'
          count={750}
          icon={<FolderCheck className='text-slate-500' size={72} />}
        />
        <DashboardCard
          title='Unit failed'
          count={1200}
          icon={<FolderX className='text-slate-500' size={72} />}
        />
      </div>
      <AnalyticsChart />
      <PostsTable title='Latest Posts' limit={15} />
      <PostsPagination/>
    </>
  );
}




// const DashboardPage = () => {
//   return (
//     <div className="flex flex-col gap-4 relative">
//       <h1 className="text-4xl sticky top-0 z-[10] p-6 bg-background/50 backdrop-blur-lg flex items-center border-b">
//         Dashboard
//       </h1>
      
//     </div>
//   )
// }

// export default DashboardPage