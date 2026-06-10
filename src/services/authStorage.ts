import type { UserProfile } from "@/types";

const ACCESS_TOKEN_KEY = "token";
const CURRENT_USER_KEY = "CURRENT_USER";
const LEGACY_USER_ID_KEY = "USER_ID";
const LEGACY_FULL_NAME_KEY = "FULL_NAME";
const PENDING_VERIFICATION_EMAIL_KEY = "USER_KEY";

const canUseStorage = (): boolean => typeof window !== "undefined";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const parseStoredUser = (value: string | null): UserProfile | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
      return null;
    }

    const id = readString(parsed.id);
    const email = readString(parsed.email);
    const fullName = readString(parsed.fullName);

    if (!id || !email || !fullName) {
      return null;
    }

    return {
      id,
      email,
      fullName,
      userName: readString(parsed.userName) ?? null,
      profilePic: readString(parsed.profilePic) ?? null,
      avatarUrl: readString(parsed.avatarUrl) ?? null,
      bio: readString(parsed.bio) ?? null,
      isEmailConfirmed:
        typeof parsed.isEmailConfirmed === "boolean"
          ? parsed.isEmailConfirmed
          : undefined,
      createdAt: readString(parsed.createdAt),
      updatedAt: readString(parsed.updatedAt),
    };
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getStoredCurrentUser = (): UserProfile | null => {
  if (!canUseStorage()) {
    return null;
  }

  const storedUser = parseStoredUser(window.localStorage.getItem(CURRENT_USER_KEY));
  if (storedUser) {
    return storedUser;
  }

  const id = window.localStorage.getItem(LEGACY_USER_ID_KEY);
  const fullName = window.localStorage.getItem(LEGACY_FULL_NAME_KEY);

  if (!id || !fullName) {
    return null;
  }

  return {
    id,
    fullName,
    email: "",
  };
};

export const setStoredCurrentUser = (user: UserProfile): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(LEGACY_USER_ID_KEY, user.id);
  window.localStorage.setItem(LEGACY_FULL_NAME_KEY, user.fullName);
};

export const removeStoredCurrentUser = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.localStorage.removeItem(LEGACY_USER_ID_KEY);
  window.localStorage.removeItem(LEGACY_FULL_NAME_KEY);
};

export const setAuthSession = (token: string, user: UserProfile): void => {
  setAccessToken(token);
  setStoredCurrentUser(user);
};

export const clearAuthSession = (): void => {
  removeAccessToken();
  removeStoredCurrentUser();
};

export const isAuthenticated = (): boolean => Boolean(getAccessToken());

export const setPendingVerificationEmail = (email: string): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
};

export const getPendingVerificationEmail = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
};

export const removePendingVerificationEmail = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
};
