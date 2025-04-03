import axiosInstance from '../config';

const chatAPI = {
  // Lấy danh sách cuộc trò chuyện cho một homestay
  getConversations: async (homestayId) => {
    try {
      const response = await axiosInstance.get(`/Chat/conversations/by-homestay/${homestayId}`);

      console.log('Raw API response:', response.data);

      // Handle case where response might not be an array
      if (!response.data) {
        console.warn('Empty response from API');
        return [];
      }

      // Ensure we're working with an array
      const dataArray = Array.isArray(response.data) ? response.data : [response.data];

      // Map the data to the expected format
      return dataArray.map(conv => {
        // Add null checks for all properties
        if (!conv) return null;

        const otherUser = conv.otherUser || {};
        const lastMessage = conv.lastMessage || {};

        return {
          conversationId: conv.conversationID,
          id: otherUser.accountID || `unknown-${Date.now()}`,
          name: otherUser.name || 'Không tên',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`,
          lastMessage: lastMessage.content || 'Bắt đầu cuộc trò chuyện',
          timestamp: formatTimestamp(lastMessage.sentAt || new Date()),
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
  getMessages: async (customerId, homestayId) => {
    try {
      const response = await axiosInstance.get(`/Chat/messages`, {
        params: {
          customerId,
          homeStayId: homestayId
        }
      });

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

      // Trả về dữ liệu đã được định dạng
      return messagesArray.map(msg => ({
        id: msg.messageID,
        sender: msg.senderID === customerId ? 'customer' : 'owner',
        text: msg.content || '',
        timestamp: formatMessageTime(msg.sentAt),
        isRead: !!msg.isRead
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (customerId, homestayId) => {
    try {
      const response = await axiosInstance.put(`/Chat/mark-as-read`, {
        customerId,
        homeStayId: homestayId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Gửi tin nhắn (backup API nếu SignalR không hoạt động)
  sendMessage: async (customerId, homestayId, content) => {
    try {
      const response = await axiosInstance.post(`/Chat/send-message`, {
        customerId,
        homeStayId: homestayId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

// Hàm định dạng thời gian
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Không có';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} giờ trước`;
    } else if (diffMins < 10080) {
      return `${Math.floor(diffMins / 1440)} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Không xác định';
  }
};

// Hàm định dạng thời gian tin nhắn
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting message time:', error);
    return '';
  }
};

export default chatAPI; 