import axiosInstance from '../config';

const chatAPI = {
  getConversations: async (homestayId) => {
    try {
      const response = await axiosInstance.get(`/Chat/conversations/by-homestay/${homestayId}`);
      console.log('Raw API response:', response.data);
      if (!response.data) {
        console.warn('Empty response from API');
        return [];
      }
      const dataArray = Array.isArray(response.data) ? response.data : [response.data];
      return dataArray.map(conv => {
        if (!conv) return null;

        const otherUser = conv.otherUser || {};
        const lastMessage = conv.lastMessage || {};
        return {
          conversationId: conv.conversationID,
          id: otherUser.accountID || `unknown-${Date.now()}`,
          name: otherUser.name || 'Không tên',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`,
          lastMessage: lastMessage.content || 'Bắt đầu cuộc trò chuyện',
          sentAt: lastMessage.sentAt,
          timestamp: new Date(lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: lastMessage.isRead === false ? 1 : 0,
          isOnline: false
        };
      }).filter(Boolean); // Remove null items
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      return [];
    }
  },

  // Lấy lịch sử tin nhắn của một cuộc trò chuyện
  getMessages: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/Chat/messages/${conversationId}`);

      console.log('Raw messages response:', response.data);

      if (!response.data) {
        console.warn('API returned empty data for messages');
        return [];
      }

      let messagesArray = response.data;
      if (!Array.isArray(messagesArray)) {
        console.warn('API response for messages is not an array');
        return [];
      }

      // Lấy thông tin người dùng hiện tại từ localStorage
      let currentUserId = null;
      try {
        const userInfo = localStorage.getItem('userInfo');
        currentUserId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
      } catch (error) {
        console.warn('Error getting current user ID:', error);
      }

      // Trả về dữ liệu đã được định dạng
      return messagesArray.map(msg => ({
        id: msg.messageID,
        sender: msg.senderID === currentUserId ? 'owner' : 'customer',
        text: msg.content || '',
        timestamp: msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
        isRead: !!msg.isRead,
        senderName: msg.senderName
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (conversationId, userId) => {
    try {
      const response = await axiosInstance.put(`/Chat/mark-all-as-read`, {
        conversationId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Gửi tin nhắn (backup API nếu SignalR không hoạt động)
  sendMessage: async (receiverId, homestayId, content, images = []) => {
    try {
      // Tạo FormData object
      const formData = new FormData();

      // Lấy thông tin người dùng từ localStorage
      const userInfo = localStorage.getItem('userInfo');
      const userInfoObj = userInfo ? JSON.parse(userInfo) : null;
      const senderId = userInfoObj?.AccountID;
      const senderName = userInfoObj?.Name || 'Owner';

      // Thêm các field vào FormData
      formData.append('SenderID', senderId);
      formData.append('ReceiverID', receiverId);
      formData.append('SenderName', senderName);
      formData.append('HomeStayId', homestayId);
      formData.append('Content', content);

      // Thêm ảnh nếu có
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('Images', image);
        });
      }

      await axiosInstance.post(`/Chat/send-message`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Tạo cuộc trò chuyện mới
  createConversation: async (receiverId, homestayId) => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      const senderId = userInfo ? JSON.parse(userInfo)?.AccountID : null;

      if (!senderId) {
        throw new Error('Sender ID is not available');
      }

      const response = await axiosInstance.post('/Chat/create-conversation', {
        receiverID: senderId,
        senderID: receiverId,
        homeStayId: homestayId,
        createdAt: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
};

export default chatAPI; 