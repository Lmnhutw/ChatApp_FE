import React from 'react';
import './globals.css';

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

export default Layout;
