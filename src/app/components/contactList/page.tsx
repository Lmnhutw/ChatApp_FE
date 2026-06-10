"use client";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { useSignalR } from "@/hooks/useSignalR";
import "./page.css";
import {
  authService,
  getApiErrorMessage,
  legacyRoomService,
  type LegacyRoom,
} from "@/services";

interface CreateLegacyRoomResponse {
  roomId: number;
}

const ContactList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<LegacyRoom[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState("");

  const { connection } = useSignalR("contactList", "CurrentUser");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await legacyRoomService.getRooms();
      setRooms(data);
      if (data.length === 0) {
        toast("No rooms available.", {
          duration: 5000,
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to fetch rooms."), {
        duration: 5000,
        position: "top-right",
        action: {
          label: "x",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleAddRoom = async () => {
    const currentUser = authService.getStoredCurrentUser();
    if (roomName.trim() && connection && currentUser?.id && currentUser.fullName) {
      try {
        const room = await connection.invoke<CreateLegacyRoomResponse>("CreateRoom", {
          RoomName: roomName,
          CreatedBy: currentUser.fullName,
          UserId: currentUser.id,
        });
        console.log("Server response: ", room);
        if (room && room.roomId) {
          setRooms([
            ...rooms,
            {
              roomId: room.roomId,
              roomName,
              createdBy: currentUser.fullName,
              userId: currentUser.id,
              members: [],
            },
          ]);
          console.log(room.roomId);
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
        } else {
          throw new Error("Invalid room data received from server");
        }
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
    const currentUser = authService.getStoredCurrentUser();

    const parsedJoinRoomId = parseInt(joinRoomIdInput, 10);

    if (parsedJoinRoomId && currentUser?.id && currentUser.fullName) {
      try {
        await legacyRoomService.joinRoom({
          RoomId: parsedJoinRoomId,
          FullName: currentUser.fullName,
          UserId: currentUser.id,
        });
        toast.success("Joined room successfully!", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
        setJoinRoomIdInput("");
        setIsJoinModalOpen(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to join room."), {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
      }
    }
  };
  // const handleRoomClick = (roomName) => {
  //   setChosenRoom(roomName);
  // };
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
        rooms.map((room) => (
          <div key={room.roomId} className="contactItem">
            {room.roomName} (ID: {room.roomId})
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
              <button onClick={handleAddRoom} className="sendButtonConfirm">
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
              value={joinRoomIdInput}
              onChange={(e) => setJoinRoomIdInput(e.target.value)}
              placeholder="Enter room ID"
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
