import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";

export interface LegacyRoom {
  roomId: number;
  roomName: string;
  createdBy: string;
  userId: string;
  members: unknown[];
}

export interface JoinLegacyRoomRequest {
  RoomId: number;
  FullName: string;
  UserId: string;
}

const getRooms = async (): Promise<LegacyRoom[]> => {
  const response = await apiClient.get<LegacyRoom[]>(apiRoutes.legacyRooms.list);
  return response.data;
};

const joinRoom = async (request: JoinLegacyRoomRequest): Promise<void> => {
  await apiClient.post(apiRoutes.legacyRooms.join, request);
};

export const legacyRoomService = {
  getRooms,
  joinRoom,
};
