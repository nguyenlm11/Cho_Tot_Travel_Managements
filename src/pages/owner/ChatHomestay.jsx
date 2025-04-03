import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaSearch, FaPaperPlane, FaRegSmile, FaUser, FaCircle, FaArrowDown } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import signalRService from '../../services/signalRService';
import chatAPI from '../../services/api/chatAPI';

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

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
        <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col"
        >
            {/* Search header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm khách hàng..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    {searchTerm && (
                        <button
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => onSearch('')}
                        >
                            <IoClose />
                        </button>
                    )}
                </div>
            </div>

            {/* Customers list */}
            <div className="overflow-y-auto flex-1">
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                        <motion.div
                            key={customer.id}
                            variants={itemVariants}
                            onClick={() => onSelectCustomer(customer.id)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 cursor-pointer 
                                transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
                                ${selectedCustomerId === customer.id ? 'bg-primary/5 dark:bg-primary/20' : ''}
                            `}
                        >
                            <div className="relative">
                                <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                                />
                                {customer.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium truncate text-gray-900 dark:text-white">{customer.name}</h3>
                                    <span className="text-xs text-gray-500">{customer.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{customer.lastMessage}</p>
                            </div>
                            {customer.unread > 0 && (
                                <span className="flex-shrink-0 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                                    {customer.unread}
                                </span>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có cuộc trò chuyện nào'}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Component hiển thị cuộc hội thoại
const Conversation = ({ customer, messages, onSendMessage, isLoading }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const chatContainerRef = useRef(null);

    // Kiểm tra khi nào nên hiện nút scroll
    const handleScroll = () => {
        if (!chatContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
        setShowScrollButton(!isAtBottom);
    };

    // Thêm event listener cho scrolling
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Khi có tin nhắn mới, chỉ scroll xuống nếu người dùng đã ở gần cuối
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
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
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

    return (
        <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col"
        >
            {customer ? (
                <>
                    {/* Conversation header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
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
                        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-4 relative"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'owner' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-xl p-3 ${message.sender === 'owner'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-600'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${message.sender === 'owner' ? 'text-white/70' : 'text-gray-500'}`}>
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
                                </div>
                            ))
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
                        {showScrollButton && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
                            >
                                <FaArrowDown />
                            </button>
                        )}
                    </div>

                    {/* Message input */}
                    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                        <div className="relative">
                            <textarea
                                className="w-full px-4 py-2 pr-24 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                placeholder="Nhập tin nhắn..."
                                rows="2"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            ></textarea>

                            {/* Emoji picker button */}
                            <div className="absolute right-14 bottom-2">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    <FaRegSmile />
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 right-0">
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
                                disabled={!newMessage.trim()}
                                className={`absolute right-2 bottom-2 p-2 rounded-full ${newMessage.trim()
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaUser className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                            Chưa chọn cuộc trò chuyện
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Vui lòng chọn một cuộc trò chuyện từ danh sách bên trái
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Component chính ChatHomestay
const ChatHomestay = () => {
    const { id: homestayId } = useParams();
    console.log("Rendering ChatHomestay with homestayId:", homestayId);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    // QUAN TRỌNG: Định nghĩa hàm handleSendMessage trước khi sử dụng nó trong JSX
    const handleSendMessage = async (text) => {
        if (!selectedCustomerId || !text.trim()) return;

        const homestayIdNumber = parseInt(homestayId);

        // Tạo tin nhắn tạm thời
        const tempMessage = {
            id: Date.now(),
            text: text.trim(),
            sender: 'owner',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sending'
        };

        // Cập nhật UI ngay lập tức
        setMessages(prev => [...prev, tempMessage]);

        // Cập nhật cuộc trò chuyện
        setCustomers(prev =>
            prev.map(customer =>
                customer.id === selectedCustomerId
                    ? { ...customer, lastMessage: text.trim(), timestamp: 'Vừa xong' }
                    : customer
            )
        );

        try {
            // Gửi tin nhắn qua SignalR
            const success = await signalRService.sendMessage(selectedCustomerId, text.trim());

            if (!success) {
                // Fallback: sử dụng API thông thường
                await chatAPI.sendMessage(selectedCustomerId, homestayIdNumber, text.trim());
            }

            // Cập nhật trạng thái tin nhắn
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, status: 'sent' }
                        : msg
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);

            // Cập nhật trạng thái lỗi
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

    // Kết nối SignalR và lấy danh sách cuộc trò chuyện khi component mount
    useEffect(() => {
        let unmounted = false;
        let retryCount = 0;
        const maxRetries = 3;
        let cleanupFunctions = [];

        const initChat = async () => {
            let success = false;

            while (!success && retryCount < maxRetries && !unmounted) {
                try {
                    setIsLoadingConversations(true);

                    // Lấy token từ localStorage
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('No authentication token available');
                    }

                    // Kết nối SignalR
                    await signalRService.startConnection(token, homestayId);

                    // Lấy danh sách cuộc trò chuyện từ API
                    console.log("Fetching conversations for homestayId:", homestayId);
                    const conversations = await chatAPI.getConversations(homestayId);
                    console.log("Received conversations:", homestayId);

                    if (!unmounted) {
                        // Force dùng cấu trúc array
                        const conversationsArray = Array.isArray(conversations) ? conversations : [];
                        console.log("Setting customers with array of length:", conversationsArray.length);

                        setCustomers(conversationsArray);
                    }

                    // Đăng ký nhận tin nhắn mới từ SignalR
                    const unsubscribeMessage = signalRService.onMessageReceived((message) => {
                        handleNewMessage(message, homestayId);
                    });
                    cleanupFunctions.push(unsubscribeMessage);

                    // Đăng ký sự kiện thay đổi trạng thái người dùng
                    const unsubscribeStatus = signalRService.onUserStatusChanged((userId, isOnline) => {
                        if (!unmounted) {
                            setCustomers(prev =>
                                prev.map(customer =>
                                    customer.id === userId
                                        ? { ...customer, isOnline }
                                        : customer
                                )
                            );
                        }
                    });
                    cleanupFunctions.push(unsubscribeStatus);

                    success = true;
                } catch (error) {
                    console.error(`Attempt ${retryCount + 1} failed:`, error);
                    retryCount++;

                    if (retryCount < maxRetries && !unmounted) {
                        console.log(`Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                        await new Promise(r => setTimeout(r, 2000));
                    }
                } finally {
                    if (!unmounted) setIsLoadingConversations(false);
                }
            }

            if (!success && !unmounted) {
                toast.error('Không thể kết nối với hệ thống chat sau nhiều lần thử. Vui lòng tải lại trang.');
            }
        };

        initChat();

        return () => {
            unmounted = true;
            signalRService.stopConnection();
            cleanupFunctions.forEach(fn => fn && typeof fn === 'function' && fn());
        };
    }, [homestayId]);

    // Xử lý tin nhắn mới từ SignalR
    const handleNewMessage = (message, homestayIdNumber) => {
        console.log('Received message:', message);

        // Lấy thông tin người gửi và nội dung
        const senderId = message.senderID;
        const content = message.content || '';
        const messageId = message.messageID || Date.now();
        const sentAt = message.sentAt;

        // Nếu đang xem cuộc trò chuyện này, cập nhật tin nhắn
        if (selectedCustomerId === senderId) {
            setMessages(prev => [
                ...prev,
                {
                    id: messageId,
                    sender: senderId === selectedCustomerId ? 'customer' : 'owner',
                    text: content,
                    timestamp: new Date(sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    isRead: false
                }
            ]);

            if (senderId === selectedCustomerId) {
                chatAPI.markAsRead(selectedCustomerId, homestayIdNumber).catch(err => {
                    console.error('Error marking message as read:', err);
                });
            }
        }

        // Cập nhật danh sách cuộc trò chuyện
        setCustomers(prev => {
            const existingIndex = prev.findIndex(c => c.id === senderId);
            if (existingIndex === -1) {
                return [
                    {
                        id: senderId,
                        name: message.senderName || 'Khách hàng',
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName || 'Khách hàng')}&background=random`,
                        lastMessage: content,
                        timestamp: 'Vừa xong',
                        unread: selectedCustomerId === senderId ? 0 : 1,
                        isOnline: true
                    },
                    ...prev
                ];
            }

            // Cập nhật cuộc trò chuyện hiện tại
            const updated = [...prev];
            const isSelected = selectedCustomerId === senderId;

            updated[existingIndex] = {
                ...updated[existingIndex],
                lastMessage: content,
                timestamp: 'Vừa xong',
                unread: isSelected ? 0 : (updated[existingIndex].unread || 0) + 1
            };

            // Di chuyển cuộc trò chuyện lên đầu
            if (existingIndex > 0) {
                const conversation = updated[existingIndex];
                updated.splice(existingIndex, 1);
                updated.unshift(conversation);
            }

            return updated;
        });
    };

    // Lấy tin nhắn khi chọn cuộc trò chuyện
    useEffect(() => {
        if (!selectedCustomerId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                setIsLoadingMessages(true);
                const homestayIdNumber = parseInt(homestayId);

                // Lấy tin nhắn từ API
                const messages = await chatAPI.getMessages(selectedCustomerId, homestayIdNumber);

                // Format tin nhắn cho UI (nếu chưa được format từ API)
                const formattedMessages = Array.isArray(messages) ? messages : [];
                setMessages(formattedMessages);

                // Đánh dấu tin nhắn đã đọc
                await chatAPI.markAsRead(selectedCustomerId, homestayIdNumber);

                // Cập nhật trạng thái đã đọc
                setCustomers(prev =>
                    prev.map(customer =>
                        customer.id === selectedCustomerId
                            ? { ...customer, unread: 0 }
                            : customer
                    )
                );
            } catch (error) {
                console.error('Error loading messages:', error);
                toast.error('Không thể tải tin nhắn');
            } finally {
                setIsLoadingMessages(false);
            }
        };

        loadMessages();
    }, [selectedCustomerId, homestayId]);

    // Find the selected customer for the conversation
    const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId);

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"
        >
            <Toaster position="bottom-right" />

            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Trò chuyện với khách hàng
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý tin nhắn của homestay #{homestayId}
                </p>
            </motion.div>

            {/* Loading indicator */}
            {isLoadingConversations && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full"></div>
                        <div>Đang tải cuộc trò chuyện...</div>
                    </div>
                </div>
            )}

            {/* Chat Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Chat List */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-1 h-full"
                >
                    <ChatList
                        customers={customers}
                        selectedCustomerId={selectedCustomerId}
                        onSelectCustomer={setSelectedCustomerId}
                        searchTerm={searchTerm}
                        onSearch={setSearchTerm}
                    />
                </motion.div>

                {/* Conversation */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2 h-full"
                >
                    <Conversation
                        customer={selectedCustomer}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoadingMessages}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ChatHomestay;