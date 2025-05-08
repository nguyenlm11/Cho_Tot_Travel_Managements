import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.registeredEvents = new Set();
    this.connection = null;
    this.connectionId = null;
    this.connectionPromise = null;
    this.onMessageReceivedCallbacks = [];
    this.onUserStatusChangedCallbacks = [];
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 5; // Tăng số lần thử lại
    this.debug = true;
    // Xác định URL dựa trên môi trường
    this.hubUrl = process.env.NODE_ENV === 'production'
      ? 'https://capstone-bookinghomestay.onrender.com/chatHub'
      : '/chatHub';
  }

  async startConnection(accessToken) {
    if (this.isConnecting && this.connectionPromise) {
      this.log("Connection already in progress, returning existing promise");
      return this.connectionPromise;
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.log("Already connected, returning existing connection");
      return Promise.resolve(this.connection);
    }

    this.isConnecting = true;
    this.log("Starting new connection attempt");

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        if (this.connection) {
          this.log("Stopping existing connection first");
          try {
            await this.connection.stop();
          } catch (err) {
            this.log("Error stopping existing connection", err);
          }
          this.connection = null;
        }

        if (!accessToken) {
          throw new Error("Access token is required");
        }

        this.log("Creating new connection object");
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(this.hubUrl, {
            accessTokenFactory: () => accessToken,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling // Thêm phương thức dự phòng
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
          .configureLogging(signalR.LogLevel.Debug)
          .build();

        this._setupEventHandlers();

        this.log("Starting connection...");
        await this.connection.start();
        this.connectionId = this.connection.connectionId;
        this.log("Connection started successfully with ID:", this.connectionId);

        await this.registerCurrentUser();

        this.retryCount = 0;
        this.isConnecting = false;
        this.notifyConnectionStatus(true);

        resolve(this.connection);
      } catch (error) {
        this.log("Connection error:", error);
        this.retryCount++;

        if (this.retryCount < this.maxRetries) {
          this.log(`Retrying (${this.retryCount}/${this.maxRetries}) in 3 seconds...`);
          setTimeout(() => {
            this.isConnecting = false;
            this.startConnection(accessToken)
              .then(resolve)
              .catch(reject);
          }, 3000);
        } else {
          this.log("Max retries reached");
          this.isConnecting = false;
          this.connection = null;
          this.connectionPromise = null;
          this.notifyConnectionStatus(false);
          reject(error);
        }
      }
    });

    return this.connectionPromise;
  }

  async registerCurrentUser() {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      this.log("Cannot register user: not connected");
      return false;
    }

    try {
      const userInfo = localStorage.getItem('userInfo');
      const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;

      if (!userId) {
        this.log("No user ID available for registration");
        return false;
      }

      this.log("Registering user with ID:", userId);
      await this.connection.invoke('RegisterUser', userId);
      this.log("User registration successful");
      return true;
    } catch (error) {
      this.log("User registration failed:", error);
      return false;
    }
  }

  async sendMessage(receiverId, text, homestayId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('Connection is not established');
      return false;
    }

    try {
      const userInfo = localStorage.getItem('userInfo');
      const senderId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
      const senderName = userInfo ? JSON.parse(userInfo)?.Name || 'Owner' : 'Owner';

      if (!senderId) {
        throw new Error('Sender ID is not available');
      }

      console.log('Sending message via SignalR:', { senderId, receiverId, text, senderName, homestayId });

      await this.connection.invoke('SendMessage', senderId, receiverId, text, senderName, homestayId, null);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async markMessagesAsRead(conversationId, userId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('Connection is not established');
      return false;
    }
    try {
      await this.connection.invoke('MarkAllMessagesAsRead', conversationId, userId);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  onMessageReceived(callback) {
    this.onMessageReceivedCallbacks = [];
    this.onMessageReceivedCallbacks.push(callback);
    return () => {
      this.onMessageReceivedCallbacks = this.onMessageReceivedCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserStatusChanged(callback) {
    this.onUserStatusChangedCallbacks.push(callback);
    return () => {
      this.onUserStatusChangedCallbacks = this.onUserStatusChangedCallbacks.filter(cb => cb !== callback);
    };
  }

  notifyConnectionStatus(isConnected) {
    this.onUserStatusChangedCallbacks.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        this.log("Error in connection status callback:", error);
      }
    });
  }

  _setupEventHandlers() {
    if (!this.connection) {
      console.error('Cannot setup event handlers: connection is null');
      return;
    }

    this.connection.off('ReceiveMessage');
    this.connection.off('MessageRead');

    this.connection.on('ReceiveMessage', (senderId, content, sentAt, messageId, conversationId) => {
      if (!messageId) {
        console.log('Skipping message without ID');
        return;
      }

      const message = {
        senderID: senderId,
        content: content || '',
        sentAt: sentAt,
        messageID: messageId,
        conversationID: conversationId
      };

      if (this.onMessageReceivedCallbacks.length > 0) {
        try {
          this.onMessageReceivedCallbacks[0](message);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      }
    });

    this.connection.on('MessageRead', (messageId) => {
      console.log('Message marked as read:', messageId);
    });
  }

  resetEventHandlers() {
    if (!this.connection) return;

    this.registeredEvents.forEach(eventName => {
      this.connection.off(eventName);
    });
    this.registeredEvents.clear();

    this._setupEventHandlers();
  }

  async stopConnection() {
    if (this.connection) {
      try {
        this.log("Stopping connection");
        await this.connection.stop();
        this.log("Connection stopped");
      } catch (error) {
        this.log("Error stopping connection:", error);
      } finally {
        this.connection = null;
        this.connectionId = null;
        this.connectionPromise = null;
        this.notifyConnectionStatus(false);
      }
    }
  }

  log(...args) {
    if (this.debug) {
      console.log("[SignalR]", ...args);
    }
  }

  getConnectionState() {
    if (!this.connection) return "Disconnected";
    return this.connection.state;
  }

  isConnected() {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }

  async checkHubStatus() {
    try {
      const response = await fetch('https://capstone-bookinghomestay.onrender.com/api/health/hub', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Hub health check failed:', error);
      return false;
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;