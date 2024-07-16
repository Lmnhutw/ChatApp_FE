"use client";
import React from "react";
import styles from "./page.module.css";

const NavigationPanel = () => {
  return (
    <div className={styles.navigationPanelContainer}>
      <div className={styles.header}>
        <h2>ChatJoy</h2>
      </div>
      <div className={styles.navItem}>Home</div>
      <div className={styles.navItem}>Chat</div>
      <div className={styles.navItem}>Settings</div>
      {/* Add more navigation items as needed */}
    </div>
  );
};

export default NavigationPanel;
