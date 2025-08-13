import { WebSocket } from 'ws';

interface ChatMessage {
  id: number;
  userId: string;
  message: string;
  timestamp: number;
}

interface ChatUser {
  id: string;
  name: string;
  socket: WebSocket;
}

class ChatBotSimulator {
  private users: ChatUser[] = [];
  private messages: ChatMessage[] = [];
  private messageIdCounter = 0;

  constructor(private wss: WebSocket.Server) {
    this.wss.on('connection', (socket) => {
      console.log('New connection');

      const user = { id: `user-${this.users.length}`, name: `User ${this.users.length}`, socket };
      this.users.push(user);

      socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        this.handleMessage(message, user);
      });

      socket.on('close', () => {
        console.log('Connection closed');
        this.removeUser(user);
      });
    });
  }

  private handleMessage(message: string, user: ChatUser) {
    const chatMessage: ChatMessage = {
      id: this.messageIdCounter++,
      userId: user.id,
      message,
      timestamp: Date.now(),
    };

    this.messages.push(chatMessage);
    this.broadcastMessage(chatMessage);
  }

  private removeUser(user: ChatUser) {
    this.users = this.users.filter((u) => u !== user);
  }

  private broadcastMessage(message: ChatMessage) {
    this.users.forEach((user) => {
      user.socket.send(JSON.stringify(message));
    });
  }

  start() {
    console.log('ChatBot Simulator started');
  }
}

const wss = new WebSocket.Server({ port: 8080 });
const chatBotSimulator = new ChatBotSimulator(wss);
chatBotSimulator.start();