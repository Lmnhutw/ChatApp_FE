"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import "./page.css";
import { useSignalR } from "@/hooks/useSignalR";

interface Room {
  roomId: number;
  roomName: string;
  createdBy: string;
  adminName: string;
  members: any[];
}

const ContactList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState("");

  const { connection, isConnected } = useSignalR("contactList", "CurrentUser");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(
        "https://localhost:5000/api/Room/GetRoomList"
      );
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        if (data.length === 0) {
          toast("No rooms available.", {
            duration: 5000,
            position: "top-right",
          });
        }
      } else {
        toast.error("Failed to fetch rooms.", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "x",
            onClick: () => toast.dismiss(),
          },
        });
      }
    } catch (error) {
      toast.error("Failed to fetch rooms.", {
        duration: 5000,
        position: "top-right",
        action: {
          label: "x",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleAddRoom = async (isTest = false) => {
    if (roomName.trim() && connection) {
      try {
        await connection.invoke(
          "CreateRoom",
          { RoomName: roomName, CreatedBy: "CurrentUser" },
          isTest
        );
        if (!isTest) {
          setRooms([
            ...rooms,
            {
              roomId: Date.now(),
              roomName,
              createdBy: "CurrentUser",
              adminName: "CurrentUser",
              members: [],
            },
          ]);
        }
        setRoomName("");
        setIsModalOpen(false);
        toast.success("Room created successfully!", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (error) {
        toast.error("Failed to create room.", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
        console.error("SignalR CreateRoom Error: ", error);
      }
    }
  };

  const handleJoinRoom = async () => {
    if (joinRoomName.trim() && connection) {
      try {
        await connection.invoke("JoinRoom", {
          RoomName: joinRoomName,
          FullName: "CurrentUser",
        });
        toast.success("Joined room successfully!", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
        setJoinRoomName("");
        setIsJoinModalOpen(false);
      } catch (error) {
        toast.error("Failed to join room.", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
        console.error("SignalR JoinRoom Error: ", error);
      }
    }
  };
  return (
    <div className="contactListContainer">
      <div className="header">
        <h2>Contacts</h2>
      </div>
      <div className="buttonContainer">
        <button
          className="sendButtonRequest"
          onClick={() => setIsModalOpen(true)}
        >
          Add
        </button>
        <button
          className="sendButtonRequest"
          onClick={() => setIsJoinModalOpen(true)}
        >
          Join
        </button>
      </div>
      {rooms.length > 0 ? (
        rooms.map((room, index) => (
          <div key={index} className="contactItem">
            {room.roomName}
          </div>
        ))
      ) : (
        <div className="noRooms">No rooms available.</div>
      )}
      {isModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <h3>Add New Room</h3>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="input"
            />
            <div className="buttonContainer">
              <button
                onClick={() => handleAddRoom(false)}
                className="sendButtonConfirm"
              >
                Create Room
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="sendButtonConfirm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isJoinModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <h3>Join Room</h3>
            <input
              type="text"
              value={joinRoomName}
              onChange={(e) => setJoinRoomName(e.target.value)}
              placeholder="Enter room name"
              className="input"
            />
            <div className="buttonContainer">
              <button onClick={handleJoinRoom} className="sendButtonConfirm">
                Join Room
              </button>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="sendButtonConfirm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster richColors expand={true} closeButton />
    </div>
  );
};

export default ContactList;
