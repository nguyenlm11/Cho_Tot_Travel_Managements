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
        timestamp: formatMessageTime(msg.sentAt),
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