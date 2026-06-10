"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useSignalR } from "@/hooks/useSignalR";
import {
  authService,
  conversationService,
  getApiErrorMessage,
  messageService,
  reactionService,
  userService,
} from "@/services";
import type {
  ConversationResponse,
  ConversationMemberResponse,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  Guid,
  MessageDeletedEvent,
  MessageReadEvent,
  MessageReaction,
  MessageResponse,
  RealtimeError,
  SignalRConnectionStatus,
  TypingChangedEvent,
  UpdateMessageRequest,
  UserBlock,
  UserPresence,
  UserProfile,
} from "@/types";

interface ChatState {
  currentUser: UserProfile | null;
  selectedConversationId: Guid | null;
  conversations: ConversationResponse[];
  messagesByConversation: Record<Guid, MessageResponse[]>;
  presenceByUserId: Record<Guid, UserPresence>;
  typingByConversation: Record<Guid, Record<Guid, TypingChangedEvent>>;
  blockedUsers: UserBlock[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  signalRStatus: SignalRConnectionStatus;
  error: string | null;
}

interface ChatContextValue {
  state: ChatState;
  selectedConversation: ConversationResponse | null;
  selectedMessages: MessageResponse[];
  isRealtimeConnected: boolean;
  refreshCurrentUser: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: Guid) => Promise<void>;
  loadBlockedUsers: () => Promise<void>;
  selectConversation: (conversationId: Guid) => Promise<void>;
  createDirectConversation: (
    request: CreateDirectConversationRequest
  ) => Promise<ConversationResponse>;
  createGroupConversation: (
    request: CreateGroupConversationRequest
  ) => Promise<ConversationResponse>;
  sendMessage: (content: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => Promise<void>;
  markMessageRead: (messageId: Guid) => Promise<void>;
  updateMessage: (messageId: Guid, request: UpdateMessageRequest) => Promise<void>;
  deleteMessage: (messageId: Guid) => Promise<void>;
  addReaction: (messageId: Guid, emoji: string) => Promise<void>;
  removeReaction: (messageId: Guid, emoji: string) => Promise<void>;
  addConversationMember: (userId: Guid) => Promise<void>;
  removeConversationMember: (userId: Guid) => Promise<void>;
  leaveSelectedConversation: () => Promise<void>;
  blockUser: (userId: Guid) => Promise<void>;
  unblockUser: (userId: Guid) => Promise<void>;
}

type ChatAction =
  | { type: "SET_CURRENT_USER"; user: UserProfile | null }
  | { type: "SET_SELECTED_CONVERSATION"; conversationId: Guid | null }
  | { type: "SET_CONVERSATIONS"; conversations: ConversationResponse[] }
  | { type: "UPSERT_CONVERSATION"; conversation: ConversationResponse }
  | {
      type: "UPSERT_CONVERSATION_MEMBER";
      conversationId: Guid;
      member: ConversationMemberResponse;
    }
  | { type: "REMOVE_CONVERSATION_MEMBER"; conversationId: Guid; userId: Guid }
  | { type: "REMOVE_CONVERSATION"; conversationId: Guid }
  | { type: "SET_MESSAGES"; conversationId: Guid; messages: MessageResponse[] }
  | { type: "UPSERT_MESSAGE"; message: MessageResponse }
  | { type: "DELETE_MESSAGE"; event: MessageDeletedEvent }
  | { type: "SET_PRESENCE"; presence: UserPresence }
  | { type: "SET_TYPING"; event: TypingChangedEvent }
  | { type: "SET_BLOCKED_USERS"; blockedUsers: UserBlock[] }
  | { type: "UPSERT_BLOCKED_USER"; userBlock: UserBlock }
  | { type: "REMOVE_BLOCKED_USER"; blockedUserId: Guid }
  | { type: "ADD_REACTION"; reaction: MessageReaction }
  | { type: "REMOVE_REACTION"; reaction: MessageReaction }
  | { type: "MARK_MESSAGE_READ"; event: MessageReadEvent }
  | { type: "SET_LOADING_CONVERSATIONS"; isLoading: boolean }
  | { type: "SET_LOADING_MESSAGES"; isLoading: boolean }
  | { type: "SET_SIGNALR_STATUS"; status: SignalRConnectionStatus }
  | { type: "SET_ERROR"; error: string | null };

const initialState: ChatState = {
  currentUser: null,
  selectedConversationId: null,
  conversations: [],
  messagesByConversation: {},
  presenceByUserId: {},
  typingByConversation: {},
  blockedUsers: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  signalRStatus: "idle",
  error: null,
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const upsertById = <T extends { id: Guid }>(items: T[], nextItem: T): T[] => {
  const index = items.findIndex((item) => item.id === nextItem.id);

  if (index === -1) {
    return [nextItem, ...items];
  }

  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
};

const upsertMemberByUserId = (
  members: ConversationMemberResponse[],
  nextMember: ConversationMemberResponse
): ConversationMemberResponse[] => {
  const index = members.findIndex(
    (member) => member.userId === nextMember.userId
  );

  if (index === -1) {
    return [...members, nextMember];
  }

  return members.map((member) =>
    member.userId === nextMember.userId ? nextMember : member
  );
};

const updateMessageInState = (
  state: ChatState,
  message: MessageResponse
): ChatState => {
  const existingMessages = state.messagesByConversation[message.conversationId] ?? [];
  const nextMessages = upsertById(existingMessages, message).sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  return {
    ...state,
    messagesByConversation: {
      ...state.messagesByConversation,
      [message.conversationId]: nextMessages,
    },
    conversations: state.conversations.map((conversation) =>
      conversation.id === message.conversationId
        ? { ...conversation, lastMessage: message }
        : conversation
    ),
  };
};

const updateMessageReactions = (
  messages: MessageResponse[],
  reaction: MessageReaction,
  mode: "add" | "remove"
): MessageResponse[] =>
  messages.map((message) => {
    if (message.id !== reaction.messageId) {
      return message;
    }

    const reactions =
      mode === "add"
        ? upsertById(message.reactions, reaction)
        : message.reactions.filter((item) => item.id !== reaction.id);

    return {
      ...message,
      reactions,
    };
  });

const reducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.user };
    case "SET_SELECTED_CONVERSATION":
      return { ...state, selectedConversationId: action.conversationId };
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.conversations };
    case "UPSERT_CONVERSATION":
      return {
        ...state,
        conversations: upsertById(state.conversations, action.conversation),
      };
    case "UPSERT_CONVERSATION_MEMBER":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId
            ? {
                ...conversation,
                members: upsertMemberByUserId(
                  conversation.members,
                  action.member
                ),
              }
            : conversation
        ),
      };
    case "REMOVE_CONVERSATION_MEMBER":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId
            ? {
                ...conversation,
                members: conversation.members.filter(
                  (member) => member.userId !== action.userId
                ),
              }
            : conversation
        ),
      };
    case "REMOVE_CONVERSATION": {
      const nextMessagesByConversation = { ...state.messagesByConversation };
      delete nextMessagesByConversation[action.conversationId];

      const conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.conversationId
      );

      return {
        ...state,
        conversations,
        messagesByConversation: nextMessagesByConversation,
        selectedConversationId:
          state.selectedConversationId === action.conversationId
            ? conversations[0]?.id ?? null
            : state.selectedConversationId,
      };
    }
    case "SET_MESSAGES":
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.conversationId]: action.messages,
        },
      };
    case "UPSERT_MESSAGE":
      return updateMessageInState(state, action.message);
    case "DELETE_MESSAGE": {
      const messages = state.messagesByConversation[action.event.conversationId] ?? [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.event.conversationId]: messages.map((message) =>
            message.id === action.event.messageId
              ? {
                  ...message,
                  status: "deleted",
                  content: "",
                  deletedAt: action.event.deletedAt,
                }
              : message
          ),
        },
      };
    }
    case "SET_PRESENCE":
      return {
        ...state,
        presenceByUserId: {
          ...state.presenceByUserId,
          [action.presence.userId]: action.presence,
        },
      };
    case "SET_TYPING": {
      const conversationTyping =
        state.typingByConversation[action.event.conversationId] ?? {};
      const nextConversationTyping = { ...conversationTyping };

      if (action.event.isTyping) {
        nextConversationTyping[action.event.userId] = action.event;
      } else {
        delete nextConversationTyping[action.event.userId];
      }

      return {
        ...state,
        typingByConversation: {
          ...state.typingByConversation,
          [action.event.conversationId]: nextConversationTyping,
        },
      };
    }
    case "SET_BLOCKED_USERS":
      return { ...state, blockedUsers: action.blockedUsers };
    case "UPSERT_BLOCKED_USER":
      return {
        ...state,
        blockedUsers: upsertById(state.blockedUsers, action.userBlock),
      };
    case "REMOVE_BLOCKED_USER":
      return {
        ...state,
        blockedUsers: state.blockedUsers.filter(
          (userBlock) => userBlock.blockedUserId !== action.blockedUserId
        ),
      };
    case "ADD_REACTION":
    case "REMOVE_REACTION": {
      const conversationId = Object.keys(state.messagesByConversation).find(
        (key) =>
          state.messagesByConversation[key]?.some(
            (message) => message.id === action.reaction.messageId
          )
      );

      if (!conversationId) {
        return state;
      }

      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updateMessageReactions(
            state.messagesByConversation[conversationId] ?? [],
            action.reaction,
            action.type === "ADD_REACTION" ? "add" : "remove"
          ),
        },
      };
    }
    case "MARK_MESSAGE_READ": {
      const messages = state.messagesByConversation[action.event.conversationId] ?? [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.event.conversationId]: messages.map((message) => {
            if (message.id !== action.event.messageId) {
              return message;
            }

            const readReceipts = upsertById(
              message.readReceipts ?? [],
              action.event
            );

            return {
              ...message,
              readReceipts,
            };
          }),
        },
      };
    }
    case "SET_LOADING_CONVERSATIONS":
      return { ...state, isLoadingConversations: action.isLoading };
    case "SET_LOADING_MESSAGES":
      return { ...state, isLoadingMessages: action.isLoading };
    case "SET_SIGNALR_STATUS":
      return { ...state, signalRStatus: action.status };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const signalR = useSignalR({
    enabled: authService.isAuthenticated(),
    onMessageReceived: (message) =>
      dispatch({ type: "UPSERT_MESSAGE", message }),
    onMessageUpdated: (message) =>
      dispatch({ type: "UPSERT_MESSAGE", message }),
    onMessageDeleted: (event) => dispatch({ type: "DELETE_MESSAGE", event }),
    onTypingChanged: (event) => dispatch({ type: "SET_TYPING", event }),
    onMessageRead: (event) => dispatch({ type: "MARK_MESSAGE_READ", event }),
    onMessageReactionAdded: (reaction) =>
      dispatch({ type: "ADD_REACTION", reaction }),
    onMessageReactionRemoved: (reaction) =>
      dispatch({ type: "REMOVE_REACTION", reaction }),
    onPresenceChanged: (presence) =>
      dispatch({ type: "SET_PRESENCE", presence }),
    onRealtimeError: (realtimeError: RealtimeError) => {
      dispatch({ type: "SET_ERROR", error: realtimeError.message });
      toast.error(realtimeError.message);
    },
  });

  const refreshCurrentUser = useCallback(async (): Promise<void> => {
    const storedUser = authService.getStoredCurrentUser();
    if (storedUser) {
      dispatch({ type: "SET_CURRENT_USER", user: storedUser });
    }

    try {
      const currentUser = await authService.getCurrentUser();
      dispatch({ type: "SET_CURRENT_USER", user: currentUser });
    } catch (error) {
      if (!authService.isAuthenticated()) {
        dispatch({ type: "SET_CURRENT_USER", user: null });
      }

      dispatch({ type: "SET_ERROR", error: getApiErrorMessage(error) });
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: Guid): Promise<void> => {
      dispatch({ type: "SET_LOADING_MESSAGES", isLoading: true });
      try {
        const messages = await messageService.getMessages(conversationId);
        dispatch({ type: "SET_MESSAGES", conversationId, messages });
        dispatch({ type: "SET_ERROR", error: null });
      } catch (error) {
        const message = getApiErrorMessage(error, "Failed to load messages.");
        dispatch({ type: "SET_ERROR", error: message });
        toast.error(message);
      } finally {
        dispatch({ type: "SET_LOADING_MESSAGES", isLoading: false });
      }
    },
    []
  );

  const selectConversation = useCallback(
    async (conversationId: Guid): Promise<void> => {
      dispatch({ type: "SET_SELECTED_CONVERSATION", conversationId });
      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  const loadConversations = useCallback(async (): Promise<void> => {
    dispatch({ type: "SET_LOADING_CONVERSATIONS", isLoading: true });
    try {
      const conversations = await conversationService.getConversations();
      dispatch({ type: "SET_CONVERSATIONS", conversations });
      dispatch({ type: "SET_ERROR", error: null });

      if (!state.selectedConversationId && conversations[0]) {
        await selectConversation(conversations[0].id);
      }
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Failed to load conversations."
      );
      dispatch({ type: "SET_ERROR", error: message });
      toast.error(message);
    } finally {
      dispatch({ type: "SET_LOADING_CONVERSATIONS", isLoading: false });
    }
  }, [selectConversation, state.selectedConversationId]);

  const loadBlockedUsers = useCallback(async (): Promise<void> => {
    try {
      const blockedUsers = await userService.getBlockedUsers();
      dispatch({ type: "SET_BLOCKED_USERS", blockedUsers });
    } catch (error) {
      dispatch({ type: "SET_ERROR", error: getApiErrorMessage(error) });
    }
  }, []);

  const createDirectConversation = useCallback(
    async (
      request: CreateDirectConversationRequest
    ): Promise<ConversationResponse> => {
      const conversation = await conversationService.createDirectConversation(
        request
      );
      dispatch({ type: "UPSERT_CONVERSATION", conversation });
      await selectConversation(conversation.id);
      return conversation;
    },
    [selectConversation]
  );

  const createGroupConversation = useCallback(
    async (
      request: CreateGroupConversationRequest
    ): Promise<ConversationResponse> => {
      const conversation = await conversationService.createGroupConversation(
        request
      );
      dispatch({ type: "UPSERT_CONVERSATION", conversation });
      await selectConversation(conversation.id);
      return conversation;
    },
    [selectConversation]
  );

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const conversationId = state.selectedConversationId;

      if (!conversationId) {
        throw new Error("Select a conversation before sending a message.");
      }

      const request = {
        conversationId,
        content: content.trim(),
      };

      if (!request.content) {
        throw new Error("Message cannot be empty.");
      }

      const realtimeMessage = signalR.isConnected
        ? await signalR.sendConversationMessage(request)
        : await messageService.sendMessage(request);

      if (realtimeMessage) {
        dispatch({ type: "UPSERT_MESSAGE", message: realtimeMessage });
      }
    },
    [signalR, state.selectedConversationId]
  );

  const sendTyping = useCallback(
    async (isTyping: boolean): Promise<void> => {
      const conversationId = state.selectedConversationId;

      if (!conversationId || !signalR.isConnected) {
        return;
      }

      await signalR.sendTyping({ conversationId, isTyping });
    },
    [signalR, state.selectedConversationId]
  );

  const markMessageRead = useCallback(
    async (messageId: Guid): Promise<void> => {
      const conversationId = state.selectedConversationId;

      if (!conversationId) {
        return;
      }

      if (signalR.isConnected) {
        await signalR.markMessageRead({ conversationId, messageId });
        return;
      }

      const receipt = await messageService.markMessageRead(messageId);
      dispatch({
        type: "MARK_MESSAGE_READ",
        event: { ...receipt, conversationId },
      });
    },
    [signalR, state.selectedConversationId]
  );

  const updateMessage = useCallback(
    async (
      messageId: Guid,
      request: UpdateMessageRequest
    ): Promise<void> => {
      if (!request.content.trim()) {
        throw new Error("Message cannot be empty.");
      }

      const updatedMessage = await messageService.updateMessage(messageId, {
        content: request.content.trim(),
      });
      dispatch({ type: "UPSERT_MESSAGE", message: updatedMessage });
    },
    []
  );

  const deleteMessage = useCallback(async (messageId: Guid): Promise<void> => {
    const conversationId = state.selectedConversationId;
    if (!conversationId) {
      return;
    }

    await messageService.deleteMessage(messageId);
    dispatch({
      type: "DELETE_MESSAGE",
      event: {
        conversationId,
        messageId,
        deletedByUserId: state.currentUser?.id,
        deletedAt: new Date().toISOString(),
      },
    });
  }, [state.currentUser?.id, state.selectedConversationId]);

  const addReaction = useCallback(
    async (messageId: Guid, emoji: string): Promise<void> => {
      if (signalR.isConnected) {
        await signalR.addReaction({ messageId, emoji });
        return;
      }

      const reaction = await reactionService.addReaction({ messageId, emoji });
      dispatch({ type: "ADD_REACTION", reaction });
    },
    [signalR]
  );

  const removeReaction = useCallback(
    async (messageId: Guid, emoji: string): Promise<void> => {
      if (signalR.isConnected) {
        await signalR.removeReaction({ messageId, emoji });
        return;
      }

      const conversationId = state.selectedConversationId;
      const reaction = conversationId
        ? state.messagesByConversation[conversationId]
            ?.find((message) => message.id === messageId)
            ?.reactions.find(
              (item) =>
                item.emoji === emoji && item.userId === state.currentUser?.id
            )
        : undefined;

      if (!reaction) {
        throw new Error("Reaction was not found.");
      }

      await reactionService.removeReaction(reaction.id);
      dispatch({ type: "REMOVE_REACTION", reaction });
    },
    [
      signalR,
      state.currentUser?.id,
      state.messagesByConversation,
      state.selectedConversationId,
    ]
  );

  const addConversationMember = useCallback(
    async (userId: Guid): Promise<void> => {
      const conversationId = state.selectedConversationId;
      if (!conversationId) {
        throw new Error("Select a conversation before adding members.");
      }

      const member = await conversationService.addMember(conversationId, {
        userId,
      });
      dispatch({
        type: "UPSERT_CONVERSATION_MEMBER",
        conversationId,
        member,
      });
    },
    [state.selectedConversationId]
  );

  const removeConversationMember = useCallback(
    async (userId: Guid): Promise<void> => {
      const conversationId = state.selectedConversationId;
      if (!conversationId) {
        throw new Error("Select a conversation before removing members.");
      }

      await conversationService.removeMember(conversationId, userId);
      dispatch({ type: "REMOVE_CONVERSATION_MEMBER", conversationId, userId });
    },
    [state.selectedConversationId]
  );

  const leaveSelectedConversation = useCallback(async (): Promise<void> => {
    const conversationId = state.selectedConversationId;
    if (!conversationId) {
      return;
    }

    await conversationService.leaveConversation(conversationId);
    dispatch({ type: "REMOVE_CONVERSATION", conversationId });
  }, [state.selectedConversationId]);

  const blockUser = useCallback(async (userId: Guid): Promise<void> => {
    const userBlock = await userService.blockUser({ blockedUserId: userId });
    dispatch({ type: "UPSERT_BLOCKED_USER", userBlock });
  }, []);

  const unblockUser = useCallback(async (userId: Guid): Promise<void> => {
    await userService.unblockUser(userId);
    dispatch({ type: "REMOVE_BLOCKED_USER", blockedUserId: userId });
  }, []);

  useEffect(() => {
    void loadBlockedUsers();
  }, [loadBlockedUsers]);

  useEffect(() => {
    dispatch({ type: "SET_SIGNALR_STATUS", status: signalR.status });
  }, [signalR.status]);

  useEffect(() => {
    void refreshCurrentUser();
    void loadConversations();
  }, [loadConversations, refreshCurrentUser]);

  useEffect(() => {
    const conversationId = state.selectedConversationId;

    if (!conversationId || !signalR.isConnected) {
      return;
    }

    void signalR.joinConversation(conversationId).catch((error: unknown) => {
      const message = getApiErrorMessage(error, "Failed to join conversation.");
      dispatch({ type: "SET_ERROR", error: message });
      toast.error(message);
    });

    return () => {
      void signalR.leaveConversation(conversationId).catch(() => undefined);
    };
  }, [signalR, state.selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      state.conversations.find(
        (conversation) => conversation.id === state.selectedConversationId
      ) ?? null,
    [state.conversations, state.selectedConversationId]
  );

  const selectedMessages = useMemo(
    () =>
      state.selectedConversationId
        ? state.messagesByConversation[state.selectedConversationId] ?? []
        : [],
    [state.messagesByConversation, state.selectedConversationId]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      selectedConversation,
      selectedMessages,
      isRealtimeConnected: signalR.isConnected,
      refreshCurrentUser,
      loadConversations,
      loadMessages,
      loadBlockedUsers,
      selectConversation,
      createDirectConversation,
      createGroupConversation,
      sendMessage,
      sendTyping,
      markMessageRead,
      updateMessage,
      deleteMessage,
      addReaction,
      removeReaction,
      addConversationMember,
      removeConversationMember,
      leaveSelectedConversation,
      blockUser,
      unblockUser,
    }),
    [
      addReaction,
      addConversationMember,
      blockUser,
      createDirectConversation,
      createGroupConversation,
      deleteMessage,
      leaveSelectedConversation,
      loadBlockedUsers,
      loadConversations,
      loadMessages,
      markMessageRead,
      refreshCurrentUser,
      removeConversationMember,
      removeReaction,
      selectConversation,
      selectedConversation,
      selectedMessages,
      sendMessage,
      sendTyping,
      signalR.isConnected,
      state,
      unblockUser,
      updateMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatContext must be used inside ChatProvider.");
  }

  return context;
};
