'use client';

import React, { useEffect } from 'react';
import { ModeToggle } from '../global/mode-toggle';
import { Book, Headphones, Search, LogIn, FilePen } from 'lucide-react';
import Templates from '../icons/cloud_download';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserButton, useAuth } from '@clerk/nextjs';
// import { useBilling } from '@/providers/billing-provider'
// import { onPaymentDetails } from '@/app/(main)/(pages)/billing/_actions/payment-connecetions'

const InfoBar = () => {
//   const { credits, tier, setCredits, setTier } = useBilling()

//   const onGetPayment = async () => {
//     const response = await onPaymentDetails()
//     if (response) {
//       setTier(response.tier!)
//       setCredits(response.credits!)
//     }
//   }

//   useEffect(() => {
//     onGetPayment()
//   }, [])

  const { userId } = useAuth();

  return (
    <div className="flex flex-row justify-end gap-6 items-center px-4 py-4 w-full dark:bg-black">
      <span className="flex items-center gap-2 font-bold">
       {/* <p className="text-sm font-light text-gray-300">Credits</p>
        {tier == 'Unlimited' ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {credits}/{tier == 'Free' ? '10' : tier == 'Pro' && '100'}
          </span>
        )}
      </span>
      <span className="flex items-center rounded-full bg-muted px-4"> */}
        <Search />
        <Input
          placeholder="Quick Search"
          className="border-none bg-transparent"
        />
      </span>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Headphones />
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact Support</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Book />
          </TooltipTrigger>
          <TooltipContent>
            <p>Guide</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <LogIn />
          </TooltipTrigger>
          <TooltipContent>
            <Link href='/sign-in'>Sign In</Link>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <FilePen />
          </TooltipTrigger>
          <TooltipContent>
            <Link href='/sign-up'>Sign Up</Link>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider> */}
      <div className='flex items-center gap-4'>
        {userId ? (
          <>
            <Link href='/dashboard'>Get Started</Link>
            <UserButton afterSignOutUrl='/' />
          </>
        ) : (
          <>
            <Link href='/sign-up'>Sign up</Link>
            <Link href='/sign-in'>Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoBar;