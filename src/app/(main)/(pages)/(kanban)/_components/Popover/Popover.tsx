"use client";
import { FC, PropsWithChildren, SyntheticEvent } from "react";
export const LinkContainer: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className
}) => {
  return (
    <ul
      data-testid="popover-menu"
      className={`w-48 animate-fade-in rounded-md bg-white p-4 shadow-md dark:bg-v-dark-grey ${
        className ?? ""
      }`}
    >
      {children}
    </ul>
  );
};
export const PopoverLink: FC<
  PropsWithChildren<{
    onClick: (e: SyntheticEvent) => void;
    danger?: boolean;
    disabled?: boolean;
    id?: string;
    className?: string;
  }>
> = ({ danger, onClick, disabled, id, children, className }) => {
  return (
    <button
      className={`cursor-pointer  ${
        danger ? "text-danger" : "text-mid-grey"
      } disabled:cursor-default disabled:text-opacity-50 text-lg`}
      onClick={onClick}
      disabled={disabled}
      id={id}
    >
      {children}
    </button>
  );
};
