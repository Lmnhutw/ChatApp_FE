import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import type {
  BlockUserRequest,
  Guid,
  UpdateProfileRequest,
  UserBlock,
  UserPresence,
  UserProfile,
} from "@/types";

const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(apiRoutes.users.current);
  return response.data;
};

const getUserProfile = async (userId: Guid): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(apiRoutes.users.profile(userId));
  return response.data;
};

const searchUsers = async (query: string): Promise<UserProfile[]> => {
  const response = await apiClient.get<UserProfile[]>(apiRoutes.users.search, {
    params: { query },
  });
  return response.data;
};

const updateProfile = async (
  request: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>(
    apiRoutes.users.current,
    request
  );
  return response.data;
};

const getPresence = async (userId: Guid): Promise<UserPresence> => {
  const response = await apiClient.get<UserPresence>(
    apiRoutes.users.presence(userId)
  );
  return response.data;
};

const getBlockedUsers = async (): Promise<UserBlock[]> => {
  const response = await apiClient.get<UserBlock[]>(apiRoutes.users.blocks);
  return response.data;
};

const blockUser = async (request: BlockUserRequest): Promise<UserBlock> => {
  const response = await apiClient.post<UserBlock>(apiRoutes.users.blocks, request);
  return response.data;
};

const unblockUser = async (blockedUserId: Guid): Promise<void> => {
  await apiClient.delete(apiRoutes.users.unblock(blockedUserId));
};

export const userService = {
  getCurrentUser,
  getUserProfile,
  searchUsers,
  updateProfile,
  getPresence,
  getBlockedUsers,
  blockUser,
  unblockUser,
};
