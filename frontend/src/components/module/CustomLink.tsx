import React from "react";
import { Link } from "react-router-dom";

export const CustomLink = ({
  className,
  children,
  to,
}: {
  className?: string;
  children: React.ReactNode;
  to: string;
}) => {
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
};
