import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaSearch, FaPaperPlane, FaRegSmile, FaUser, FaCircle, FaArrowDown, FaImage, FaTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import signalRService from '../../services/signalRService';
import chatAPI from '../../services/api/chatAPI';

// Component hiển thị danh sách cuộc trò chuyện
const ChatList = ({ customers, selectedCustomerId, onSelectCustomer, searchTerm, onSearch }) => {
    const searchInputRef = useRef(null);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    return (
        <div className="h-full flex flex-col">
            {/* Search header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm khách hàng..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    {searchTerm && (
                        <button
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            onClick={() => onSearch('')}
                        >
                            <IoClose />
                        </button>
                    )}
                </div>
            </div>

            {/* Customers list */}
            <div className="flex-grow min-h-0 overflow-y-auto">
                {filteredCustomers.length > 0 ? (
                    <AnimatePresence>
                        {filteredCustomers.map(customer => (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => onSelectCustomer(customer.id)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 cursor-pointer 
                  transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50
                  ${selectedCustomerId === customer.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            `}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={customer.avatar}
                                        alt={customer.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                    />
                                    {customer.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium truncate text-gray-900 dark:text-white">{customer.name}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{customer.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{customer.lastMessage}</p>
                                </div>
                                {customer.unread > 0 && (
                                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                                        {customer.unread}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có cuộc trò chuyện nào'}
                    </div>
                )}
            </div>
        </div>
    );
};

const Conversation = ({ customer, messages, onSendMessage, isLoading }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const messagesEndRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleScroll = () => {
        if (!chatContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
        setShowScrollButton(!isAtBottom);
    };

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        if (!chatContainerRef.current || messages.length === 0) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;

        // Chỉ tự động scroll khi tin nhắn mới được thêm vào và người dùng đang ở gần cuối
        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            setShowScrollButton(true);
        }
    }, [messages]);

    const handleSendMessageClick = () => {
        if (newMessage.trim() || selectedImages.length > 0) {
            onSendMessage(newMessage.trim(), selectedImages);
            setNewMessage('');
            setSelectedImages([]);
            setShowEmojiPicker(false);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setShowScrollButton(false);
            }, 100);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageClick();
        }
    };

    const handleEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeSelectedImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-full flex flex-col">
            {customer ? (
                <>
                    {/* Conversation header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between sticky top-0 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                />
                                {customer.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {customer.isOnline ? (
                                        <>
                                            <FaCircle className="w-2 h-2 text-green-500" />
                                            Đang hoạt động
                                        </>
                                    ) : (
                                        'Không hoạt động'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-grow min-h-0 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.1) 0, rgba(0, 0, 0, 0) 70%)' }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : messages.length > 0 ? (
                            <AnimatePresence initial={false}>
                                {messages.map((message, index) => {
                                    const isFirstInGroup = index === 0 ||
                                        messages[index - 1].sender !== message.sender;
                                    const isLastInGroup = index === messages.length - 1 ||
                                        messages[index + 1].sender !== message.sender;

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${message.sender === 'owner' ? 'justify-end' : 'justify-start'} 
                        ${!isLastInGroup ? 'mb-1' : 'mb-3'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-2xl shadow-sm
                          ${message.sender === 'owner'
                                                        ? 'bg-blue-500 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                                                    } ${isFirstInGroup ? (message.sender === 'owner' ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}
                          ${isLastInGroup ? (message.sender === 'owner' ? 'rounded-br-none' : 'rounded-bl-none') : ''}`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                                <div className={`text-xs mt-1 flex items-center justify-end gap-1 
                          ${message.sender === 'owner' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
                                                >
                                                    {message.timestamp}
                                                    {message.sender === 'owner' && message.status && (
                                                        <span>
                                                            {message.status === 'sending' && '⌛'}
                                                            {message.status === 'sent' && '✓'}
                                                            {message.status === 'error' && '❌'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <FaRegSmile className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện với khách hàng!</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollButton && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={scrollToBottom}
                                    className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
                                >
                                    <FaArrowDown />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Selected images preview */}
                    {selectedImages.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 flex-shrink-0">
                            {selectedImages.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt={`Selected ${index}`}
                                        className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                                    />
                                    <button
                                        onClick={() => removeSelectedImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Message input */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 flex-shrink-0 sticky bottom-0">
                        <div className="relative">
                            <textarea
                                className="w-full px-4 py-2 pr-28 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                                placeholder="Nhập tin nhắn..."
                                rows={Math.min(3, Math.max(1, newMessage.split('\n').length))}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            ></textarea>

                            {/* File upload button */}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute right-20 bottom-2 p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FaImage />
                            </button>

                            {/* Emoji picker button */}
                            <div className="absolute right-10 bottom-2">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <FaRegSmile />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 right-0 z-10">
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            width={300}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Send button */}
                            <button
                                onClick={handleSendMessageClick}
                                disabled={!newMessage.trim() && selectedImages.length === 0}
                                className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${newMessage.trim() || selectedImages.length > 0
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/30"
                    style={{ backgroundImage: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.1) 0, rgba(0, 0, 0, 0) 70%)' }}>
                    <div className="text-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaUser className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-3">
                            Chưa chọn cuộc trò chuyện
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin với khách hàng
                        </p>
                        <div className="w-16 h-1 bg-blue-500/50 mx-auto rounded-full"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Component chính - Trang ChatHomestay
const ChatHomestay = () => {
    const { id: homestayId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    // Các ref cần thiết
    const messageIdSet = useRef(new Set());
    const customersRef = useRef([]);
    const currentConversationIdRef = useRef(null);
    const lastFetchTimeRef = useRef({});

    // Thêm effect này để cập nhật ref
    useEffect(() => {
        customersRef.current = customers;
    }, [customers]);

    // Điều quan trọng: Định nghĩa handleNewMessage TRƯỚC useEffect để tránh recreate function
    const handleNewMessage = useCallback((message) => {
        console.log('Checking message:', message.messageID);

        // Kiểm tra nghiêm ngặt để tránh duplicate
        if (!message.messageID || messageIdSet.current.has(message.messageID)) {
            console.log('Skipping duplicate message:', message.messageID);
            return;
        }

        // Thêm ID vào set
        messageIdSet.current.add(message.messageID);
        console.log('Processing new message:', message.messageID);

        // Lấy thông tin người dùng
        const userInfo = localStorage.getItem('userInfo');
        const currentUserId = userInfo ? JSON.parse(userInfo)?.AccountID : null;

        // Xác định người gửi/nhận
        const senderId = message.senderID;
        const isMyMessage = senderId === currentUserId;

        // Xác định partner
        let partnerId;
        if (isMyMessage) {
            // Sử dụng ref để truy cập customers hiện tại khi cần
            const currentCustomers = customersRef.current;
            const conversation = currentCustomers.find(c => c.conversationId === message.conversationID);
            partnerId = conversation?.id || selectedCustomerId;
        } else {
            partnerId = senderId;
        }

        // Xác định trạng thái đang xem
        const isViewingConversation = selectedCustomerId === partnerId;

        // Cập nhật UI - QUAN TRỌNG: sử dụng functional update để tránh dependency
        if (isViewingConversation) {
            setMessages(prevMessages => {
                // Kiểm tra lại để đảm bảo không trùng lặp
                if (prevMessages.some(m => m.id === message.messageID)) {
                    return prevMessages;
                }

                const newMessage = {
                    id: message.messageID,
                    sender: isMyMessage ? 'owner' : 'customer',
                    text: message.content,
                    timestamp: new Date(message.sentAt).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                    }),
                    isRead: false
                };

                return [...prevMessages, newMessage];
            });
        }

        // Cập nhật danh sách cuộc trò chuyện
        setCustomers(prevCustomers => {
            const existingIndex = prevCustomers.findIndex(c => c.id === partnerId);

            if (existingIndex === -1 && !isMyMessage) {
                // Add new conversation if not found
                return [
                    {
                        id: partnerId,
                        name: 'Khách hàng',
                        conversationId: message.conversationID,
                        avatar: `https://ui-avatars.com/api/?name=Customer&background=random`,
                        lastMessage: message.content,
                        timestamp: 'Vừa xong',
                        unread: isViewingConversation ? 0 : 1,
                        isOnline: false
                    },
                    ...prevCustomers
                ];
            } else if (existingIndex >= 0) {
                // Update existing conversation
                const updatedList = [...prevCustomers];
                updatedList[existingIndex] = {
                    ...updatedList[existingIndex],
                    lastMessage: message.content,
                    timestamp: 'Vừa xong',
                    unread: isViewingConversation
                        ? updatedList[existingIndex].unread
                        : (updatedList[existingIndex].unread || 0) + 1
                };

                // Move conversation to top
                if (existingIndex > 0) {
                    const conversation = updatedList[existingIndex];
                    updatedList.splice(existingIndex, 1);
                    updatedList.unshift(conversation);
                }

                return updatedList;
            }

            return prevCustomers;
        });
    }, [selectedCustomerId]); // CHỈ có selectedCustomerId, KHÔNG có messages

    // Sửa useEffect SignalR để tránh vòng lặp vô hạn
    useEffect(() => {
        console.log('Setting up SignalR...');
        let isMounted = true;
        let unsubscribeFunction = null;

        const setupSignalR = async () => {
            try {
                // Lấy token
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }

                // Đóng kết nối cũ và xóa các handlers cũ
                await signalRService.stopConnection();

                // Tạo kết nối mới
                await signalRService.startConnection(token);

                // Đăng ký người dùng
                const userInfo = localStorage.getItem('userInfo');
                const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
                if (userId) {
                    await signalRService.connection.invoke('RegisterUser', userId);
                }

                // Đảm bảo xóa hết callback cũ trước khi đăng ký mới
                if (unsubscribeFunction) {
                    unsubscribeFunction();
                    unsubscribeFunction = null;
                }

                // BỎ HOÀN TOÀN onMessageReceived trong quá trình khởi tạo
                // Sau đó đăng ký riêng trong một useEffect khác

                // Lấy danh sách cuộc trò chuyện
                const conversations = await chatAPI.getConversations(homestayId);

                if (isMounted) {
                    const conversationsArray = Array.isArray(conversations) ? conversations : [];
                    setCustomers(conversationsArray);
                    setIsLoadingConversations(false);
                }

                return () => { };
            } catch (error) {
                console.error('Error setting up SignalR:', error);
                if (isMounted) {
                    setIsLoadingConversations(false);
                    toast.error('Không thể kết nối chat');
                }
                return () => { };
            }
        };

        setIsLoadingConversations(true);
        setupSignalR();

        // Cleanup
        return () => {
            isMounted = false;
            if (unsubscribeFunction) {
                unsubscribeFunction();
            }
        };
    }, [homestayId]); // LOẠI BỎ handleNewMessage khỏi deps

    // Tạo useEffect riêng để đăng ký message callback
    useEffect(() => {
        console.log('Setting up message handler...');
        // Chỉ đăng ký callback khi connection đã được thiết lập
        if (signalRService.isConnected()) {
            const unsubscribe = signalRService.onMessageReceived(handleNewMessage);
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [handleNewMessage]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            console.log('Component unmounting - stopping SignalR');
            signalRService.stopConnection();
        };
    }, []);

    // Check connection status periodically
    useEffect(() => {
        const checkConnection = () => {
            const status = signalRService.connection?.state || 'Disconnected';
            setConnectionStatus(status);
        };

        checkConnection();
        const interval = setInterval(checkConnection, 3000);

        return () => clearInterval(interval);
    }, []);

    // Handler for sending messages
    const handleSendMessage = async (text, images = []) => {
        if ((!selectedCustomerId || !text.trim()) && images.length === 0) return;

        const tempMessage = {
            id: Date.now(),
            text: text.trim(),
            sender: 'owner',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sending'
        };

        // Update UI immediately
        setMessages(prev => [...prev, tempMessage]);

        // Update conversation list
        setCustomers(prev =>
            prev.map(customer =>
                customer.id === selectedCustomerId
                    ? { ...customer, lastMessage: text.trim() || 'Đã gửi hình ảnh', timestamp: 'Vừa xong' }
                    : customer
            )
        );

        try {
            // Send message via SignalR
            const success = await signalRService.sendMessage(selectedCustomerId, text.trim(), homestayId);

            if (!success) {
                // Fallback to REST API
                await chatAPI.sendMessage(selectedCustomerId, homestayId, text.trim(), images);
            }

            // Update message status
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);

            // Update message status to error
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, status: 'error' }
                        : msg
                )
            );

            toast.error('Không thể gửi tin nhắn');
        }
    };

    // Sửa useEffect fetch messages
    useEffect(() => {
        if (!selectedCustomerId) {
            setMessages([]);
            // Reset message ID set khi chuyển conversation để tránh các ID cũ ảnh hưởng
            messageIdSet.current.clear();
            return;
        }

        // Tìm conversationId sử dụng customersRef để tránh dependency
        const customersList = customersRef.current;
        const customer = customersList.find(c => c.id === selectedCustomerId);
        const conversationId = customer?.conversationId;

        if (!conversationId) {
            console.log('No conversation ID found for this customer');
            return;
        }

        // Kiểm tra xem conversationId có thay đổi không
        if (currentConversationIdRef.current === conversationId) {
            console.log('Skipping fetch - same conversation ID');
            return;
        }

        // Lưu conversationId hiện tại
        currentConversationIdRef.current = conversationId;

        // Sử dụng biến cục bộ để tránh stale closures
        const currentConversationId = conversationId;

        console.log(`Starting to load messages for conversation ${currentConversationId}`);

        const now = Date.now();

        // Nếu đã fetch trong khoảng 2 giây qua, bỏ qua
        if (lastFetchTimeRef.current[currentConversationId] &&
            now - lastFetchTimeRef.current[currentConversationId] < 2000) {
            console.log('Throttling fetch - too soon since last fetch');
            return;
        }

        // Cập nhật thời gian fetch
        lastFetchTimeRef.current[currentConversationId] = now;

        const loadMessages = async () => {
            try {
                setIsLoadingMessages(true);
                console.log(`Loading messages for conversation ${currentConversationId}`);

                const messagesData = await chatAPI.getMessages(currentConversationId);

                // Chỉ cập nhật state nếu vẫn đang xem cùng một conversation
                if (currentConversationIdRef.current === currentConversationId) {
                    const formattedMessages = Array.isArray(messagesData) ? messagesData : [];

                    // Cập nhật messageIdSet với tất cả ID từ API để tránh duplicate với SignalR
                    formattedMessages.forEach(msg => {
                        if (msg.id) messageIdSet.current.add(msg.id);
                    });

                    setMessages(formattedMessages);

                    // Đánh dấu đã đọc
                    const userInfo = localStorage.getItem('userInfo');
                    const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
                    if (userId) {
                        await signalRService.markMessagesAsRead(currentConversationId, userId);
                    }

                    // Cập nhật unread count - sử dụng functional update để tránh phụ thuộc vào customers
                    setCustomers(prev =>
                        prev.map(c =>
                            c.id === selectedCustomerId
                                ? { ...c, unread: 0 }
                                : c
                        )
                    );
                } else {
                    console.log('Skipping state update - conversation changed');
                }
            } catch (error) {
                console.error('Error loading messages:', error);
                toast.error('Không thể tải tin nhắn');
            } finally {
                // Chỉ cập nhật loading state nếu vẫn đang xem cùng conversation
                if (currentConversationIdRef.current === currentConversationId) {
                    setIsLoadingMessages(false);
                }
            }
        };

        loadMessages();
    }, [selectedCustomerId]); // Bỏ customers khỏi dependency array

    // Find the selected customer
    const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId);

    // Gỡ lỗi re-renders
    // console.log('Rendering ChatHomestay');

    // Cụ thể, nếu thực sự cần debugging sâu hơn, thêm useEffect này:
    useEffect(() => {
        console.log('customers state changed');
    }, [customers]);

    useEffect(() => {
        console.log('selectedCustomerId changed to:', selectedCustomerId);
    }, [selectedCustomerId]);

    useEffect(() => {
        console.log('messages state changed');
    }, [messages]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <Toaster position="bottom-right" />
            <header className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Trò chuyện với khách hàng
                    </h1>
                </div>
            </header>

            {isLoadingConversations && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">Đang tải cuộc trò chuyện</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vui lòng đợi trong giây lát...</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                <div className="md:col-span-1 h-full">
                    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                        <ChatList
                            customers={customers}
                            selectedCustomerId={selectedCustomerId}
                            onSelectCustomer={setSelectedCustomerId}
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                        />
                    </div>
                </div>

                <div className="md:col-span-2 h-full">
                    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                        <Conversation
                            customer={selectedCustomer}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoadingMessages}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatHomestay;