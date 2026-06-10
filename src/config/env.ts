const trimTrailingSlash = (value: string | undefined): string =>
  value?.trim().replace(/\/+$/, "") ?? "";

export const appConfig = {
  apiUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL),
  signalRHubUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SIGNALR_HUB_URL),
};

export const isApiConfigured = Boolean(appConfig.apiUrl);
export const isSignalRConfigured = Boolean(appConfig.signalRHubUrl);
