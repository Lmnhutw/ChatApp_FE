### README

# Real-Time Chat Frontend

## Description
This project is a real-time chat application frontend built with [Next.js](https://nextjs.org/) and utilizes [SignalR](https://dotnet.microsoft.com/en-us/apps/aspnet/signalr) for real-time communication. It serves as the front-end part of the ChatApp project, complementing the backend service [ChatApp_BE](https://github.com/Lmnhutw/ChatApp_BE) which handles user authentication, message routing, and storage.

## Features
- Real-time messaging with SignalR
- User-friendly interface built with Next.js
- Responsive design for mobile and desktop

## Getting Started
To start the development server, run one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Once the server is running, open [http://localhost:3000](http://localhost:3000) in your browser to access the chat application.

### Development
You can modify the project by editing the `app/page.tsx` file. Any changes made will automatically update in the browser.

This project leverages [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) for optimized font loading, specifically the Inter font.

## Real-Time Communication with SignalR
This frontend connects to a SignalR backend to enable real-time chat functionality. Ensure that the backend server is running and properly configured to handle WebSocket connections.

## Additional Resources
For more information about Next.js and SignalR, explore the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about the framework’s features and API.
- [Next.js Interactive Tutorial](https://nextjs.org/learn) - A step-by-step guide to mastering Next.js.
- [SignalR Documentation](https://dotnet.microsoft.com/en-us/apps/aspnet/signalr) - Learn about real-time communication with SignalR.

## Deployment
The simplest way to deploy your Next.js chat application is via [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app).

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for detailed instructions on deploying your app.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project does not have a license specified.

---
