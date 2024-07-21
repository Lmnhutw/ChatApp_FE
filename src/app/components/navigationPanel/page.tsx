/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./pagePanel.css";
import userImage from "../../../../public/user.png";

interface User {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  profilePic: string;
}

const NavigationPanel: React.FC = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("USER_ID");
        if (!userId) {
          throw new Error("User ID not found in local storage.");
        }
        const response = await axios.get(
          `https://localhost:5000/api/Auth/GetUserById/${userId}`
        );

        if (response.status === 200) {
          console.log(response.data);
          setUser(response.data);
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="navigationPanelContainer">
      <div className="header__panel">
        <h2>ChatJoy</h2>
        <div className="nav__itemAll">
          <div className="navItem">Home</div>
          <div className="navItem">Chat</div>
          <div className="navItem">Settings</div>
        </div>
      </div>

      {user && (
        <div className="userProfile">
          <img src={userImage.src} alt="Profile picture" className="avatar" />
          <span>{user.fullName}</span>
        </div>
      )}
    </div>
  );
};

export default NavigationPanel;
