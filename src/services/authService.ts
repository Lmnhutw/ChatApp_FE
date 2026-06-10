import { apiClient, ApiClientError } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import {
  clearAuthSession,
  getAccessToken,
  getPendingVerificationEmail,
  getStoredCurrentUser,
  isAuthenticated,
  removeAccessToken,
  removePendingVerificationEmail,
  setAccessToken,
  setAuthSession,
  setPendingVerificationEmail,
  setStoredCurrentUser,
} from "./authStorage";
import type { Guid, UserProfile } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface ConfirmEmailRequest {
  email: string;
  token: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  user: UserProfile;
}

export interface RegisterResponse {
  id?: Guid;
  email: string;
  fullName?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

export interface EmailActionResponse {
  message?: string;
  Message?: string;
}

interface BackendAuthResponse {
  token?: string;
  accessToken?: string;
  jwtToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  user: UserProfile;
}

const normalizeAuthResponse = (response: BackendAuthResponse): AuthResponse => {
  const token = response.token ?? response.accessToken ?? response.jwtToken;

  if (!token) {
    throw new ApiClientError({
      message: "Login succeeded but the response did not include an access token.",
      details: response,
    });
  }

  return {
    token,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
    user: response.user,
  };
};

const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<BackendAuthResponse>(
    apiRoutes.auth.login,
    request
  );
  const authResponse = normalizeAuthResponse(response.data);
  setAuthSession(authResponse.token, authResponse.user);
  return authResponse;
};

const register = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    apiRoutes.auth.register,
    request
  );
  setPendingVerificationEmail(response.data.email);
  return response.data;
};

const resendVerificationEmail = async (
  email: string
): Promise<EmailActionResponse> => {
  const response = await apiClient.post<EmailActionResponse>(
    apiRoutes.auth.resendVerificationEmail(email),
    {}
  );
  return response.data;
};

const confirmEmail = async (
  request: ConfirmEmailRequest
): Promise<EmailActionResponse> => {
  const response = await apiClient.post<EmailActionResponse>(
    apiRoutes.auth.confirmEmail,
    request
  );
  return response.data;
};

const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(apiRoutes.auth.currentUser);
  setStoredCurrentUser(response.data);
  return response.data;
};

const getUserById = async (userId: Guid): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(apiRoutes.auth.userById(userId));
  setStoredCurrentUser(response.data);
  return response.data;
};

const checkAuth = async (): Promise<UserProfile | null> => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    return await getCurrentUser();
  } catch {
    clearAuthSession();
    return null;
  }
};

const logout = (): void => {
  clearAuthSession();
  removePendingVerificationEmail();
};

export const authService = {
  login,
  register,
  resendVerificationEmail,
  confirmEmail,
  getCurrentUser,
  getUserById,
  checkAuth,
  logout,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getStoredCurrentUser,
  isAuthenticated,
  getPendingVerificationEmail,
};
