import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { useSignalR } from "@/hooks/useSignalR";
import "./page.css";
import axios from "axios";

interface Room {
  roomId: number;
  roomName: string;
  createdBy: string;
  userId: string;
  members: any[];
}

const ContactList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState<number | null>(null);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState("");
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
    const userId = localStorage.getItem("USER_ID");
    const fullName = localStorage.getItem("FULL_NAME");
    if (roomName.trim() && connection && userId && fullName) {
      try {
        const room = await connection.invoke("CreateRoom", {
          RoomName: roomName,
          CreatedBy: fullName,
          UserId: userId,
        });
        console.log("Server response: ", room);
        if (room && room.roomId) {
          setRooms([
            ...rooms,
            {
              roomId: room.roomId,
              roomName,
              createdBy: fullName,
              userId,
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
    const userId = localStorage.getItem("USER_ID");
    const fullName = localStorage.getItem("FULL_NAME");

    const parsedJoinRoomId = parseInt(joinRoomIdInput, 10); // Parse input to integer

    if (parsedJoinRoomId && userId && fullName) {
      try {
        const response = await axios.post(
          "https://localhost:5000/api/Room/JoinRoom",
          {
            RoomId: parsedJoinRoomId,
            FullName: fullName,
            UserId: userId,
          }
        );
        if (response.status === 200) {
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
        } else {
          throw new Error("Failed to join room");
        }
      } catch (error) {
        toast.error("Failed to join room.", {
          duration: 5000,
          position: "top-right",
          action: {
            label: "X",
            onClick: () => toast.dismiss(),
          },
        });
        console.error("JoinRoom Error: ", error);
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
