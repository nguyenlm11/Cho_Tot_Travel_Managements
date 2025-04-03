import * as signalR from '@microsoft/signalr';

// Service để quản lý kết nối SignalR
class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionId = null;
    this.connectionPromise = null;
    this.onMessageReceivedCallbacks = [];
    this.onUserStatusChangedCallbacks = [];
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Khởi tạo kết nối đến SignalR hub
  async startConnection(accessToken, homestayId) {
    // Nếu đang kết nối, không làm gì
    if (this.isConnecting) {
      console.log('Connection attempt already in progress');
      return this.connectionPromise;
    }

    // Nếu đã có kết nối, trả về
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      console.log('Connection already established');
      return Promise.resolve(this.connection);
    }

    // Thiết lập state đang kết nối
    this.isConnecting = true;

    // Tạo promise mới cho kết nối này
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        // Nếu đã có connection, hãy đóng nó trước
        if (this.connection) {
          try {
            // Check connection state before stopping
            if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
              await this.connection.stop();
              console.log('Previous connection stopped');
            }
          } catch (stopError) {
            console.warn('Error stopping previous connection:', stopError);
            // Tiếp tục ngay cả khi có lỗi dừng kết nối cũ
          }
          this.connection = null;
        }

        // Kiểm tra accessToken trước khi sử dụng
        if (!accessToken) {
          throw new Error('Access token is required for SignalR connection');
        }
        let userId = null;
        try {
          const userInfo = localStorage.getItem('userInfo');
          userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
          if (!userId) {
            console.warn('User ID not found in localStorage, this may cause connection issues');
          }
        } catch (userError) {
          console.warn('Error getting user ID:', userError);
        }

        // Tạo connection mới với cấu hình rõ ràng hơn
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(`https://localhost:7221/chathub`, { 
            accessTokenFactory: () => accessToken,
            skipNegotiation: false, 
            transport: signalR.HttpTransportType.WebSockets
          })
          .withAutomaticReconnect([0, 1000, 5000, 10000])
          .configureLogging(signalR.LogLevel.Information)
          .build();

        // Đăng ký các event handlers trước khi kết nối
        this._setupEventHandlers();

        // Kiểm tra kết nối trước khi start
        if (!this.connection) {
          throw new Error('Failed to create SignalR connection object');
        }

        // Bắt đầu kết nối
        console.log('Attempting to start SignalR connection...');
        await this.connection.start();
        this.connectionId = this.connection.connectionId;
        console.log('Connected to SignalR hub successfully!');

        if (userId) {
          try {
            console.log('Registering user with ID:', userId);
            // Sử dụng phương thức RegisterUser của ChatHub
            await this.connection.invoke('RegisterUser', userId);
            console.log('User registered successfully with hub');
          } catch (registrationError) {
            console.warn('Failed to register user with hub:', registrationError);
          }
        } else {
          console.warn('User ID not available, connection may not be properly registered');
        }

        this.retryCount = 0;
        this.isConnecting = false;
        resolve(this.connection);
      } catch (error) {
        console.error('Error connecting to SignalR hub:', error);
        this.retryCount++;

        if (this.retryCount < this.maxRetries) {
          console.log(`Retrying in 2 seconds... (${this.retryCount}/${this.maxRetries})`);
          setTimeout(() => {
            this.isConnecting = false;
            this.startConnection(accessToken, homestayId)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          console.error('Max retries reached, giving up on SignalR connection');
          this.isConnecting = false;
          this.connection = null; 
          this.connectionPromise = null;
          reject(error);
        }
      }
    });
    return this.connectionPromise;
  }

  // Dừng kết nối
  async stopConnection() {
    if (this.connection) {
      try {
        // Only attempt to stop if not already disconnected
        if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
          await this.connection.stop();
          console.log('Connection to SignalR hub stopped');
        }
        this.connection = null;
        this.connectionId = null;
        this.connectionPromise = null;
      } catch (error) {
        console.error('Error stopping the connection:', error);
      }
    }
  }

  async sendMessage(receiverId, text) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('Connection is not established');
      return false;
    }

    try {
      // Lấy userId từ localStorage - Fixed to use userInfo instead of user for consistency
      const userInfo = localStorage.getItem('userInfo');
      const senderId = userInfo ? JSON.parse(userInfo)?.AccountID : null;

      if (!senderId) {
        throw new Error('Sender ID is not available');
      }
      await this.connection.invoke('SendMessage', senderId, receiverId, text);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessagesAsRead(conversationId) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.error('Connection is not established');
      return false;
    }
    try {
      await this.connection.invoke('MarkMessagesAsRead', conversationId);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Đăng ký callback khi nhận tin nhắn mới
  onMessageReceived(callback) {
    this.onMessageReceivedCallbacks.push(callback);
    return () => {
      this.onMessageReceivedCallbacks = this.onMessageReceivedCallbacks.filter(cb => cb !== callback);
    };
  }

  // Đăng ký callback khi trạng thái người dùng thay đổi
  onUserStatusChanged(callback) {
    this.onUserStatusChangedCallbacks.push(callback);
    return () => {
      this.onUserStatusChangedCallbacks = this.onUserStatusChangedCallbacks.filter(cb => cb !== callback);
    };
  }

  // Đăng ký các event handlers
  _setupEventHandlers() {
    if (!this.connection) {
      console.error('Cannot setup event handlers: connection is null');
      return;
    }

    // Đăng ký sự kiện nhận tin nhắn mới
    this.connection.on('ReceiveMessage', (message) => {
      console.log('New message received:', message);
      this.onMessageReceivedCallbacks.forEach(callback => callback(message));
    });

    // Đăng ký sự kiện thay đổi trạng thái người dùng
    this.connection.on('UserStatusChanged', (userId, isOnline) => {
      console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
      this.onUserStatusChangedCallbacks.forEach(callback => callback(userId, isOnline));
    });

    // Đăng ký sự kiện khi reconnected
    this.connection.onreconnected((connectionId) => {
      console.log('Reconnected to SignalR hub with ID:', connectionId);
      this.connectionId = connectionId;

      // Thử đăng ký lại userId sau khi reconnect
      try {
        const userInfo = localStorage.getItem('userInfo');  // Fixed to use userInfo consistently
        const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;

        if (userId && this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
          this.connection.invoke('RegisterUser', userId)
            .then(() => console.log('User re-registered after reconnection'))
            .catch(err => console.warn('Failed to re-register user after reconnection:', err));
        }
      } catch (error) {
        console.warn('Error trying to re-register after reconnection:', error);
      }
    });

    // Xử lý sự kiện khi kết nối bị ngắt
    this.connection.onclose((error) => {
      console.log('SignalR connection closed');
      if (error) {
        console.error('Connection closed with error:', error);
      }
    });

    // Add reconnecting event handler to provide better logging
    this.connection.onreconnecting((error) => {
      console.log('SignalR connection lost, attempting to reconnect...');
      if (error) {
        console.warn('Reconnection attempt error:', error);
      }
    });
  }

  async checkHubStatus() {
    try {
      const response = await fetch('https://localhost:7221/api/health/hub', {
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

// Singleton instance
const signalRService = new SignalRService();
export default signalRService;