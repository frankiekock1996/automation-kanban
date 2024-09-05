import React from 'react';
import clsx from 'clsx';

type Props = {
  selected: boolean;
};

const Teamwork = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="19.5" cy="12.2" r="12.1" fill="#fff"
        className={clsx(
          'dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]',
          { 'dark:!fill-[#C8C7FF] fill-[#7540A9] ': selected }
        )}
      />
      <path
        d="M6,66.699h1.2v24c0,3.301,2.7,6,6,6h12.6c3.3,0,6-2.699,6-6V89.3c-1.1-2.101-1.8-4.5-1.8-7v-31.4c0-6.1,3.7-11.4,9-13.7"
        className={clsx(
          'dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]',
          { 'dark:!fill-[#C8C7FF] fill-[#7540A9] ': selected }
        )}
      />
      <circle cx="103.3" cy="12.2" r="12.1"
        className={clsx(
          'dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]',
          { 'dark:!fill-[#C8C7FF] fill-[#7540A9]': selected }
        )}
      />
      <path
        d="M83.699,34.7v2.4c5.301,2.3,9,7.6,9,13.7v31.3c0,2.5-0.6,4.9-1.799,7v1.4c0,3.3,2.699,6,6,6h12.6c3.3,0,6-2.7,6-6v-24 h1.199c3.301,0,6-2.7,6-6V34.7c0-3.3-2.699-6-6-6h-27C86.4,28.7,83.699,31.399,83.699,34.7z"
        className={clsx(
          'dark:group-hover:fill-[#C8C7FF] transition-all dark:fill-[#353346] fill-[#BABABB] group-hover:fill-[#7540A9]',
          { 'dark:!fill-[#C8C7FF] fill-[#7540A9]': selected }
        )}
      />
      <path
        d="M39.1,50.899L39.1,50.899v9.8v21.6c0,3.3,2.7,6,6,6h2.3v28.3c0,3.3,2.7,6,6,6h16.1c3.3,0,6-2.7,6-6v-28.4h2.3c3.3,0,6-2.699,6-6V60.7v-9.8l0,0c0-3.3-2.7-6-6-6H45.1C41.7,44.899,39.1,47.6,39.1,50.899z"
        className={clsx(
          'dark:group-hover:fill-[#9F54FF] transition-all dark:fill-[#C0BFC4] fill-[#5B5966] group-hover:fill-[#BD8AFF]',
          { 'dark:!fill-[#9F54FF] fill-[#BD8AFF] ': selected }
        )}
      />
      <circle cx="61.4" cy="26" r="13.9"
        className={clsx(
          'dark:group-hover:fill-[#9F54FF] transition-all dark:fill-[#C0BFC4] fill-[#5B5966] group-hover:fill-[#BD8AFF]',
          { 'dark:!fill-[#9F54FF] fill-[#BD8AFF] ': selected }
        )}
      />
    </svg>
  );
};

export default Teamwork;