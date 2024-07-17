"use client";
import React from "react";
import "./page.css";

const NavigationPanel = () => {
  return (
    <div className="navigationPanelContainer">
      <div className="header">
        <h2>ChatJoy</h2>
      </div>
      <div className="navItem">Home</div>
      <div className="navItem">Chat</div>
      <div className="navItem">Settings</div>
      {/* Add more navigation items as needed */}
    </div>
  );
};

export default NavigationPanel;
