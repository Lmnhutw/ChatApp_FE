# ChatApp Frontend

Next.js + React + TypeScript frontend for the ChatApp backend. The app is now built around production conversation-based chat: JWT authentication, GUID conversation IDs, REST service modules, and SignalR conversation events.

## Features

- JWT login, registration, email verification resend, auth check, and logout.
- Centralized API client with environment-based base URL, Bearer token injection, error parsing, and 401 cleanup.
- Typed service layer for auth, conversations, messages, users, reactions, and attachments.
- Conversation-based chat state through React Context.
- SignalR connection with JWT auth and automatic reconnect.
- Conversation list, direct/group creation, user search, message send/edit/delete, reactions, typing indicators, read receipts, presence, member management, and user blocking controls.

## Requirements

- Node.js compatible with Next.js 14.
- npm.
- ChatApp backend running with the expected REST and SignalR endpoints.

## Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-host
NEXT_PUBLIC_SIGNALR_HUB_URL=https://your-backend-host/hub
```

Do not hardcode backend URLs in components. All backend access should go through `src/services`.

## Getting Started

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Architecture

```text
src/
  app/
    chatjoy/              Main chat route and chat-specific global CSS
    Register/             Registration and verification UI
  components/
    Auth/                 Login UI
    chat/                 Chat panels and conversation UI components
  context/
    ChatContext.tsx       Current user, conversations, messages, presence, typing, blocked users
  hooks/
    useSignalR.ts         Typed SignalR connection/events/methods
  services/
    apiClient.ts          Shared axios client, auth header, error handling
    authService.ts        Auth workflows and token helpers
    conversationService.ts
    messageService.ts
    userService.ts
    reactionService.ts
    attachmentService.ts
  types/
    dtos.ts               Backend DTOs and realtime event contracts
```

## Backend Contract

The frontend assumes these API areas exist:

- `POST /api/Auth/login`
- `POST /api/Auth/register`
- `GET /api/Auth/me`
- `POST /api/Auth/resend-verification-email/{email}`
- `/api/Conversations`
- `/api/Conversations/direct`
- `/api/Conversations/group`
- `/api/Conversations/{conversationId}/messages`
- `/api/Messages/{messageId}`
- `/api/Messages/{messageId}/read`
- `/api/Messages/{messageId}/reactions`
- `/api/Users/search?query=...`
- `/api/Users/blocks`
- `/api/Attachments`

SignalR hub methods used by the frontend:

- `JoinConversation`
- `LeaveConversation`
- `SendConversationMessage`
- `SendTyping`
- `MarkMessageRead`
- `AddReaction`
- `RemoveReaction`

SignalR events handled by the frontend:

- `MessageReceived`
- `MessageUpdated`
- `MessageDeleted`
- `TypingChanged`
- `MessageRead`
- `MessageReactionAdded`
- `MessageReactionRemoved`
- `PresenceChanged`
- `RealtimeError`

## Development Rules

- Keep backend URLs in `.env.local`.
- Do not call `fetch` or `axios` directly from UI components.
- Do not read or write `localStorage` directly from UI components.
- Add shared backend contracts to `src/types/dtos.ts`.
- Add backend calls through focused service modules in `src/services`.
- Keep reusable UI components outside `src/app` unless they are route files.

## Verification

Run before handoff:

```bash
npm run lint
npm run build
```

Useful source checks:

```bash
rg "https://localhost:5000|http://localhost:5000" src
rg "JoinRoom|LeaveRoom|\"SendMessage\"|/api/Room" src
rg "localStorage" src --glob "!src/services/authStorage.ts"
```

## Notes

- The app uses `sonner` for toast messages.
- If `NEXT_PUBLIC_API_URL` is missing, authenticated API calls fail fast with a configuration error.
- The chat UI is available at `/chatjoy` after login.
