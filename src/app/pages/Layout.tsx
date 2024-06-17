import React from 'react';
import '../styles/globals.css';

const layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <title>ChatApp</title>
            </head>
            <body>{children}</body>
        </html>
    );
};

export default layout;
