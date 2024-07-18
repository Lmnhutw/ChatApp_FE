import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { useSignalR } from "@/hooks/useSignalR";
import "./page.css";
import axios from "axios";

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
  const [clickRoom, setClickRoom] = useState("");
  const [user, setUser] = useState<{
    id: string;
    email: string;
    userName: string;
    fullName: string;
    profilePic: string;
  } | null>(null);

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

  const handleAddRoom = async () => {
    if (roomName.trim() && connection) {
      try {
        const userId = localStorage.getItem("USER_ID");
        if (!userId) {
          throw new Error("User ID not found in local storage.");
        }

        const response = await axios.get(
          `https://localhost:5000/api/Auth/GetUserById/${userId}`
        );
        if (response.status === 200) {
          setUser(response.data);
        } else {
          console.error("Failed to fetch user data.");
        }

        await connection.invoke("CreateRoom", {
          RoomName: roomName,
          CreatedBy: userId,
        });
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
    if (roomName.trim() && connection) {
      try {
        await connection.invoke("CreateRoom", {
          RoomName: roomName,
          CreatedBy: "CurrentUser",
        });
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
