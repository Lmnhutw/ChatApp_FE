"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import userImage from "../../../public/user.png";
import { authService, getApiErrorMessage } from "@/services";
import { toast } from "sonner";
import type { UserProfile } from "@/types";

const NavigationPanel: React.FC = () => {
  const [user, setUser] = useState<UserProfile>();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = authService.getStoredCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        if (!storedUser?.id) {
          toast.error(getApiErrorMessage(error, "Failed to fetch user data."));
          return;
        }

        try {
          const fallbackUser = await authService.getUserById(storedUser.id);
          setUser(fallbackUser);
        } catch (fallbackError) {
          toast.error(
            getApiErrorMessage(fallbackError, "Failed to fetch user data.")
          );
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out.");
    router.push("/");
  };

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
          <button type="button" className="logoutButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default NavigationPanel;
