import React from "react";
import "./globals.css";
import { Toaster } from "sonner";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>ChatApp</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

<Toaster richColors />;
export default Layout;
