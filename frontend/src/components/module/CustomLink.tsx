import React from "react";
import { Link } from "react-router-dom";

export const CustomLink = ({
  className,
  children,
  to,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  to?: string;
  onClick?: (e: any) => void;
}) => {
  return (
    <Link onClick={onClick} className={className} to={to ? to : ""}>
      {children}
    </Link>
  );
};
