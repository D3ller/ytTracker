<p align="center">
  <a href="" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="Youtube logo">
  </a>
</p>

<p align="center">
<a href=""><img src="https://img.shields.io/badge/version-v.1.0.0-red"</a>
<a href="https://chat.vitejs.dev"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
</p>

# YT Stats Tracker 📊

> Track your daily stats on YouTube

## Description

YT Stats Tracker is a web application for tracking YouTube video and channel statistics. This project is built entirely in TypeScript and uses ElysiaJS as its backend framework, ensuring a modern, scalable setup. It is also open-source, making it freely available for anyone to use and modify. With this tool, users can monitor how many times a video has been viewed, the frequency of watching a channel, and the time spent on each video. This project is built using Bun, offering a fast and lightweight expe...

### Prerequisites

Before you begin, make sure you have [Bun](https://bun.sh) installed on your system. To install Bun, run the following command:

```sh
curl -fsSL https://bun.sh/install | bash
```

### Running the App

After installing Bun, you can start the development server by navigating to the project directory and running:

```sh
bun dev
```

This command will launch the server, allowing you to view and interact with the YT Stats Tracker app.

### Corrective Actions

- **Correct the `env.local` file**: Ensure that the environment variables are properly configured for your development and production setup. This includes the database connection string and any API keys.
- **Add a Prisma seed**: To initialize the database with a default user, create a Prisma seed file and run the following command:

  ```sh
  bunx seed
  ```

  This will populate your database with essential initial data.

### Browser Extension Setup

For a complete experience, YT Stats Tracker requires a browser extension. To add the extension, follow these steps:

1. Open your browser's extensions page.
2. Enable "Developer Mode."
3. Load an unpacked extension by selecting the directory containing the extension source code.

Once loaded, this extension will connect with the YT Stats Tracker server, allowing seamless tracking of YouTube activities.

### Conclusion

YT Stats Tracker is a straightforward way to analyze YouTube viewing habits, providing insight into video consumption patterns. Follow the above steps to get up and running quickly!
