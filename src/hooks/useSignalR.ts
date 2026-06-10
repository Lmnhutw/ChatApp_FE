"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { appConfig } from "@/config/env";
import { getAccessToken } from "@/services/authStorage";
import type {
  AddReactionRequest,
  Guid,
  MarkMessageReadRequest,
  MessageDeletedEvent,
  MessageReadEvent,
  MessageReaction,
  MessageResponse,
  RealtimeError,
  RemoveReactionRequest,
  SendTypingRequest,
  SendMessageRequest,
  SignalRConnectionStatus,
  TypingChangedEvent,
  UserPresence,
} from "@/types";

export interface SignalREventHandlers {
  onMessageReceived?: (message: MessageResponse) => void;
  onMessageUpdated?: (message: MessageResponse) => void;
  onMessageDeleted?: (event: MessageDeletedEvent) => void;
  onTypingChanged?: (event: TypingChangedEvent) => void;
  onMessageRead?: (event: MessageReadEvent) => void;
  onMessageReactionAdded?: (reaction: MessageReaction) => void;
  onMessageReactionRemoved?: (reaction: MessageReaction) => void;
  onPresenceChanged?: (presence: UserPresence) => void;
  onRealtimeError?: (error: RealtimeError) => void;
}

export interface UseSignalROptions extends SignalREventHandlers {
  enabled?: boolean;
}

export interface UseSignalRResult {
  connection: HubConnection | null;
  status: SignalRConnectionStatus;
  isConnected: boolean;
  error: string | null;
  joinConversation: (conversationId: Guid) => Promise<void>;
  leaveConversation: (conversationId: Guid) => Promise<void>;
  sendConversationMessage: (
    request: SendMessageRequest
  ) => Promise<MessageResponse | void>;
  sendTyping: (request: SendTypingRequest) => Promise<void>;
  markMessageRead: (request: MarkMessageReadRequest) => Promise<void>;
  addReaction: (request: AddReactionRequest) => Promise<void>;
  removeReaction: (request: RemoveReactionRequest) => Promise<void>;
}

const useSignalR = (options: UseSignalROptions = {}): UseSignalRResult => {
  const {
    enabled = true,
    onMessageReceived,
    onMessageUpdated,
    onMessageDeleted,
    onTypingChanged,
    onMessageRead,
    onMessageReactionAdded,
    onMessageReactionRemoved,
    onPresenceChanged,
    onRealtimeError,
  } = options;

  const handlersRef = useRef<SignalREventHandlers>({});
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [status, setStatus] = useState<SignalRConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  handlersRef.current = {
    onMessageReceived,
    onMessageUpdated,
    onMessageDeleted,
    onTypingChanged,
    onMessageRead,
    onMessageReactionAdded,
    onMessageReactionRemoved,
    onPresenceChanged,
    onRealtimeError,
  };

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      setConnection(null);
      return;
    }

    if (!appConfig.signalRHubUrl) {
      setStatus("error");
      setError("SignalR hub URL is not configured.");
      return;
    }

    let isDisposed = false;

    const nextConnection = new HubConnectionBuilder()
      .withUrl(appConfig.signalRHubUrl, {
        accessTokenFactory: () => getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    nextConnection.on("MessageReceived", (message: MessageResponse) => {
      handlersRef.current.onMessageReceived?.(message);
    });

    nextConnection.on("MessageUpdated", (message: MessageResponse) => {
      handlersRef.current.onMessageUpdated?.(message);
    });

    nextConnection.on("MessageDeleted", (event: MessageDeletedEvent) => {
      handlersRef.current.onMessageDeleted?.(event);
    });

    nextConnection.on("TypingChanged", (event: TypingChangedEvent) => {
      handlersRef.current.onTypingChanged?.(event);
    });

    nextConnection.on("MessageRead", (event: MessageReadEvent) => {
      handlersRef.current.onMessageRead?.(event);
    });

    nextConnection.on("MessageReactionAdded", (reaction: MessageReaction) => {
      handlersRef.current.onMessageReactionAdded?.(reaction);
    });

    nextConnection.on("MessageReactionRemoved", (reaction: MessageReaction) => {
      handlersRef.current.onMessageReactionRemoved?.(reaction);
    });

    nextConnection.on("PresenceChanged", (presence: UserPresence) => {
      handlersRef.current.onPresenceChanged?.(presence);
    });

    nextConnection.on("RealtimeError", (realtimeError: RealtimeError) => {
      setError(realtimeError.message);
      handlersRef.current.onRealtimeError?.(realtimeError);
    });

    nextConnection.onreconnecting((connectionError) => {
      setStatus("reconnecting");
      setError(connectionError?.message ?? "Reconnecting to chat service.");
    });

    nextConnection.onreconnected(() => {
      setStatus("connected");
      setError(null);
    });

    nextConnection.onclose((connectionError) => {
      if (isDisposed) {
        return;
      }

      setStatus(connectionError ? "error" : "disconnected");
      setError(connectionError?.message ?? null);
      setConnection(null);
    });

    setStatus("connecting");
    setError(null);

    nextConnection
      .start()
      .then(() => {
        if (isDisposed) {
          return;
        }

        setConnection(nextConnection);
        setStatus("connected");
        setError(null);
      })
      .catch((connectionError: unknown) => {
        if (isDisposed) {
          return;
        }

        setConnection(null);
        setStatus("error");
        setError(
          connectionError instanceof Error
            ? connectionError.message
            : "Unable to connect to the chat service."
        );
      });

    return () => {
      isDisposed = true;
      setConnection(null);
      void nextConnection.stop();
    };
  }, [enabled]);

  const invokeHub = useCallback(
    async <TResponse,>(
      methodName: string,
      ...args: unknown[]
    ): Promise<TResponse> => {
      if (!connection || connection.state !== HubConnectionState.Connected) {
        throw new Error("Chat realtime connection is not connected.");
      }

      return connection.invoke<TResponse>(methodName, ...args);
    },
    [connection]
  );

  const joinConversation = useCallback(
    async (conversationId: Guid): Promise<void> => {
      await invokeHub<void>("JoinConversation", conversationId);
    },
    [invokeHub]
  );

  const leaveConversation = useCallback(
    async (conversationId: Guid): Promise<void> => {
      await invokeHub<void>("LeaveConversation", conversationId);
    },
    [invokeHub]
  );

  const sendConversationMessage = useCallback(
    async (request: SendMessageRequest): Promise<MessageResponse | void> =>
      invokeHub<MessageResponse | void>("SendConversationMessage", request),
    [invokeHub]
  );

  const sendTyping = useCallback(
    async (request: SendTypingRequest): Promise<void> => {
      await invokeHub<void>("SendTyping", request);
    },
    [invokeHub]
  );

  const markMessageRead = useCallback(
    async (request: MarkMessageReadRequest): Promise<void> => {
      await invokeHub<void>("MarkMessageRead", request);
    },
    [invokeHub]
  );

  const addReaction = useCallback(
    async (request: AddReactionRequest): Promise<void> => {
      await invokeHub<void>("AddReaction", request);
    },
    [invokeHub]
  );

  const removeReaction = useCallback(
    async (request: RemoveReactionRequest): Promise<void> => {
      await invokeHub<void>("RemoveReaction", request);
    },
    [invokeHub]
  );

  return useMemo(
    () => ({
      connection,
      status,
      isConnected: status === "connected",
      error,
      joinConversation,
      leaveConversation,
      sendConversationMessage,
      sendTyping,
      markMessageRead,
      addReaction,
      removeReaction,
    }),
    [
      addReaction,
      connection,
      error,
      joinConversation,
      leaveConversation,
      markMessageRead,
      removeReaction,
      sendConversationMessage,
      sendTyping,
      status,
    ]
  );
};

export { useSignalR };
