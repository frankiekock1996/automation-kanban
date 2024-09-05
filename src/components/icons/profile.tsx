import React from 'react';
import clsx from 'clsx';

type Props = {
  selected: boolean;
};

const Profile = ({ selected }: Props) => {
  return (
    <svg
     width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
      
       <path
       fillRule="evenodd"
       clipRule="evenodd"
       d="M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
 
       className={clsx(
          'dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]',
          { 'dark:!fill-[#C8C7FF] fill-[#7540A9] ': selected }
        )}
       />
        <path
       fillRule="evenodd"
       clipRule="evenodd"
       d="M18.5 19.5L20 21M11 14C7.13401 14 4 17.134 4 21H11M19 17.5C19 18.8807 17.8807 20 16.5 20C15.1193 20 14 18.8807 14 17.5C14 16.1193 15.1193 15 16.5 15C17.8807 15 19 16.1193 19 17.5Z"
 
       className={clsx(
        'dark:group-hover:fill-[#9F54FF] transition-all dark:fill-[#C0BFC4] fill-[#5B5966] group-hover:fill-[#BD8AFF] ',
        { 'dark:!fill-[#9F54FF] fill-[#BD8AFF]': selected }
        )}
       />  
    </svg>
  )
}

export default Profile;