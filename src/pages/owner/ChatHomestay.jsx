import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { FaSearch, FaPaperPlane, FaRegSmile, FaUser, FaCircle, FaArrowDown, FaImage, FaTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import signalRService from '../../services/signalRService';
import chatAPI from '../../services/api/chatAPI';

const isCloudinaryImageUrl = (text) => {
    return typeof text === 'string' && text.match(/https?:\/\/res\.cloudinary\.com\/.+\.(jpg|jpeg|png|gif|webp)/i);
};

const parseMessageContent = (text) => {
    if (!text) return { hasImages: false, content: [] };
    if (isCloudinaryImageUrl(text)) {
        return {
            hasImages: true,
            content: [{ type: 'image', url: text }]
        };
    }

    const imageUrlRegex = /(https?:\/\/res\.cloudinary\.com\/[^\s]+?\.(jpg|jpeg|png|gif|webp))/gi;
    const matches = text.match(imageUrlRegex);

    if (matches && matches.length > 0) {
        const parts = [];
        let lastIndex = 0;
        let result;
        while ((result = imageUrlRegex.exec(text)) !== null) {
            const matchIndex = result.index;
            if (matchIndex > lastIndex) {
                const textPart = text.substring(lastIndex, matchIndex).trim();
                if (textPart) {
                    parts.push({ type: 'text', content: textPart });
                }
            }
            parts.push({ type: 'image', url: result[0] });
            lastIndex = matchIndex + result[0].length;
        }

        if (lastIndex < text.length) {
            const remainingText = text.substring(lastIndex).trim();
            if (remainingText) {
                parts.push({ type: 'text', content: remainingText });
            }
        }
        return { hasImages: true, content: parts };
    }
    return {
        hasImages: false,
        content: [{ type: 'text', content: text }]
    };
};

const ChatHomestay = () => {
    const { id: homestayId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState(30);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const messageIdSet = useRef(new Set());
    const customersRef = useRef([]);
    const currentConversationIdRef = useRef(null);
    const lastFetchTimeRef = useRef({});
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        customersRef.current = customers;
    }, [customers]);

    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
        setShowScrollButton(!isAtBottom);
    };

    const loadMoreMessages = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleMessages(prev => prev + 30);
            setIsLoadingMore(false);
        }, 500);
    };

    useEffect(() => {
        setVisibleMessages(30);
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
            setShowScrollButton(false);
        }, 300);
    }, [selectedCustomerId]);

    const scrollAfterMessagesLoaded = () => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
            setShowScrollButton(false);
        }, 100);
    };

    useEffect(() => {
        if (!chatContainerRef.current || messages.length === 0) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
        const lastMessage = messages[messages.length - 1];
        const isMyNewMessage = lastMessage && lastMessage.sender === 'owner' &&
            (lastMessage.status === 'sending' || lastMessage.status === 'sent');

        if (isAtBottom || isMyNewMessage) {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
            setShowScrollButton(false);
        } else {
            setShowScrollButton(true);
        }
    }, [messages]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(newMessage, selectedImages);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            setShowScrollButton(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeSelectedImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const displayedMessages = useMemo(() => {
        if (messages.length <= visibleMessages) {
            return messages;
        }
        return messages.slice(messages.length - visibleMessages);
    }, [messages, visibleMessages]);

    const hasMoreMessages = messages.length > visibleMessages;
    const handleNewMessage = useCallback((message) => {
        if (!message.messageID || messageIdSet.current.has(message.messageID)) {
            return;
        }
        messageIdSet.current.add(message.messageID);

        const userInfo = localStorage.getItem('userInfo');
        const currentUserId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
        const senderId = message.senderID;
        const isMyMessage = senderId === currentUserId;

        let partnerId;
        if (isMyMessage) {
            const currentCustomers = customersRef.current;
            const conversation = currentCustomers.find(c => c.conversationId === message.conversationID);
            partnerId = conversation?.id || selectedCustomerId;
        } else {
            partnerId = senderId;
        }
        const isViewingConversation = selectedCustomerId === partnerId;

        if (isViewingConversation) {
            setMessages(prevMessages => {
                if (prevMessages.some(m => m.id === message.messageID)) {
                    return prevMessages;
                }
                const newMessage = {
                    id: message.messageID,
                    sender: isMyMessage ? 'owner' : 'customer',
                    text: message.content,
                    timestamp: 'Vừa xong',
                    isRead: false
                };

                return [...prevMessages, newMessage];
            });
        }

        setCustomers(prevCustomers => {
            const existingIndex = prevCustomers.findIndex(c => c.id === partnerId);
            if (existingIndex === -1 && !isMyMessage) {
                return [
                    {
                        id: partnerId,
                        name: 'Khách hàng',
                        conversationId: message.conversationID,
                        avatar: `https://ui-avatars.com/api/?name=Customer&background=random`,
                        lastMessage: message.content,
                        timestamp: 'Vừa xong',
                        lastMessageTime: message.sentAt || new Date().toISOString(),
                        unread: isViewingConversation ? 0 : 1,
                        isOnline: false
                    },
                    ...prevCustomers
                ];
            } else if (existingIndex >= 0) {
                const updatedList = [...prevCustomers];
                updatedList[existingIndex] = {
                    ...updatedList[existingIndex],
                    lastMessage: message.content,
                    timestamp: 'Vừa xong',
                    lastMessageTime: message.sentAt || new Date().toISOString(),
                    unread: isViewingConversation
                        ? updatedList[existingIndex].unread
                        : (updatedList[existingIndex].unread || 0) + 1
                };
                const conversation = updatedList[existingIndex];
                updatedList.splice(existingIndex, 1);
                updatedList.unshift(conversation);
                return updatedList;
            }
            return prevCustomers;
        });
    }, [selectedCustomerId]);

    useEffect(() => {
        let isMounted = true;
        let unsubscribeFunction = null;
        const setupSignalR = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }
                await signalRService.stopConnection();
                await signalRService.startConnection(token);
                const userInfo = localStorage.getItem('userInfo');
                const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
                if (userId) {
                    await signalRService.connection.invoke('RegisterUser', userId);
                }
                if (unsubscribeFunction) {
                    unsubscribeFunction();
                    unsubscribeFunction = null;
                }
                const conversations = await chatAPI.getConversations(homestayId);
                if (isMounted) {
                    const conversationsArray = Array.isArray(conversations) ? conversations : [];
                    console.log("conversationsArray", conversationsArray);
                    const sortedConversations = conversationsArray.sort((a, b) => {
                        if (a.timestamp && b.timestamp) {
                            return new Date(b.timestamp) - new Date(a.timestamp);
                        }
                        if (a.updatedAt && b.updatedAt) {
                            return new Date(b.updatedAt) - new Date(a.updatedAt);
                        }
                        return 0;
                    });

                    setCustomers(sortedConversations);
                    setIsLoadingConversations(false);
                }
                return () => { };
            } catch (error) {
                if (isMounted) {
                    setIsLoadingConversations(false);
                    toast.error('Không thể kết nối chat');
                }
                return () => { };
            }
        };
        setIsLoadingConversations(true);
        setupSignalR();
        return () => {
            isMounted = false;
            if (unsubscribeFunction) {
                unsubscribeFunction();
            }
        };
    }, [homestayId]);

    useEffect(() => {
        if (signalRService.isConnected()) {
            const unsubscribe = signalRService.onMessageReceived(handleNewMessage);
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [handleNewMessage]);

    useEffect(() => {
        return () => {
            signalRService.stopConnection();
        };
    }, []);

    const handleSendMessage = async (text = newMessage, images = selectedImages) => {
        const messageText = text || newMessage;
        const messageImages = images || selectedImages;
        if ((!selectedCustomerId || !messageText.trim()) && messageImages.length === 0) return;

        // Tạo tin nhắn tạm thời
        const tempMessage = {
            id: `temp-${Date.now()}`,
            sender: 'owner',
            text: messageText.trim() || 'Đã gửi hình ảnh',
            timestamp: 'Vừa xong',
            isRead: false
        };

        // Cập nhật UI ngay lập tức
        setMessages(prev => [...prev, tempMessage]);
        setCustomers(prev =>
            prev.map(customer =>
                customer.id === selectedCustomerId
                    ? {
                        ...customer,
                        lastMessage: messageText.trim() || 'Đã gửi hình ảnh',
                        timestamp: 'Vừa xong',
                        lastMessageTime: new Date().toISOString()
                    }
                    : customer
            )
        );

        try {
            await chatAPI.sendMessage(selectedCustomerId, homestayId, messageText.trim(), messageImages);
            setNewMessage('');
            setSelectedImages([]);
            setShowEmojiPicker(false);
            
            // Scroll xuống dưới sau khi gửi
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
                setShowScrollButton(false);
            }, 100);
        } catch (error) {
            // Nếu gửi thất bại, xóa tin nhắn tạm
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            toast.error('Không thể gửi tin nhắn');
        }
    };

    useEffect(() => {
        if (!selectedCustomerId) {
            setMessages([]);
            messageIdSet.current.clear();
            return;
        }
        const customersList = customersRef.current;
        const customer = customersList.find(c => c.id === selectedCustomerId);
        const conversationId = customer?.conversationId;
        if (!conversationId) {
            console.log('No conversation ID found for this customer');
            return;
        }
        if (currentConversationIdRef.current === conversationId) {
            console.log('Skipping fetch - same conversation ID');
            return;
        }
        currentConversationIdRef.current = conversationId;
        const currentConversationId = conversationId;
        const now = Date.now();

        if (lastFetchTimeRef.current[currentConversationId] &&
            now - lastFetchTimeRef.current[currentConversationId] < 2000) {
            console.log('Throttling fetch - too soon since last fetch');
            return;
        }
        lastFetchTimeRef.current[currentConversationId] = now;
        const loadMessages = async () => {
            try {
                setIsLoadingMessages(true);
                const messagesData = await chatAPI.getMessages(currentConversationId);
                if (currentConversationIdRef.current === currentConversationId) {
                    const formattedMessages = Array.isArray(messagesData) ? messagesData : [];
                    setMessages(formattedMessages);
                    const userInfo = localStorage.getItem('userInfo');
                    const userId = userInfo ? JSON.parse(userInfo)?.AccountID : null;
                    if (userId) {
                        await signalRService.markMessagesAsRead(currentConversationId, userId);
                    }
                    setCustomers(prev =>
                        prev.map(c =>
                            c.id === selectedCustomerId
                                ? { ...c, unread: 0 }
                                : c
                        )
                    );
                    scrollAfterMessagesLoaded();
                } else {
                    console.log('Skipping state update - conversation changed');
                }
            } catch (error) {
                console.error('Error loading messages:', error);
                toast.error('Không thể tải tin nhắn');
            } finally {
                if (currentConversationIdRef.current === currentConversationId) {
                    setIsLoadingMessages(false);
                }
            }
        };
        loadMessages();
    }, [selectedCustomerId]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;

        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.lastMessage && customer.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return filtered.sort((a, b) => {
            if (a.lastMessageTime && b.lastMessageTime) {
                return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
            }
            return 0;
        });
    }, [customers, searchTerm]);

    const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId);
    return (
        <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] flex overflow-hidden">
            <Toaster position="bottom-right" />

            {isLoadingConversations && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex items-center gap-5 max-w-md transform transition-all duration-300 scale-100">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-t-4 border-primary dark:border-primary-dark border-r-4 border-transparent animate-spin"></div>
                            <div className="absolute inset-3 rounded-full border-t-4 border-primary-light dark:border-primary-light border-l-4 border-transparent animate-spin animation-delay-500"></div>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white text-lg">Đang kết nối</p>
                            <p className="text-gray-500 dark:text-gray-400">Đang tải cuộc trò chuyện, vui lòng đợi trong giây lát...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Danh sách cuộc trò chuyện - fixed width */}
            <div className="w-[350px] h-full flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Trò chuyện</h2>
                </div>

                {/* Search box */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách hàng..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                onClick={() => setSearchTerm('')}
                            >
                                <IoClose size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Danh sách cuộc trò chuyện - scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    {filteredCustomers.length > 0 ? (
                        <div className="py-2">
                            {filteredCustomers.map(customer => (
                                <div
                                    key={customer.id}
                                    onClick={() => setSelectedCustomerId(customer.id)}
                                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-200
                                        hover:bg-gray-50 dark:hover:bg-gray-700 
                                        ${selectedCustomerId === customer.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary dark:border-primary-dark' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={customer.avatar}
                                            alt={customer.name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
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
                                        <span className="flex-shrink-0 w-6 h-6 bg-primary dark:bg-primary-dark text-white rounded-full text-xs flex items-center justify-center">
                                            {customer.unread}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 mt-8">
                            {searchTerm ? (
                                <>
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                        <FaSearch className="text-gray-400 dark:text-gray-500 text-xl" />
                                    </div>
                                    <p>Không tìm thấy cuộc trò chuyện phù hợp</p>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                        <FaRegSmile className="text-gray-400 dark:text-gray-500 text-xl" />
                                    </div>
                                    <p>Chưa có cuộc trò chuyện nào</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Phần nội dung cuộc trò chuyện */}
            <div className="flex-1 h-full flex flex-col bg-[#f5f6f7] dark:bg-gray-900">
                {selectedCustomer ? (
                    <>
                        {/* Header cuộc trò chuyện */}
                        <div className="h-16 px-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={selectedCustomer.avatar}
                                        alt={selectedCustomer.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                    {selectedCustomer.isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        {selectedCustomer.isOnline ? (
                                            <>
                                                <FaCircle className="w-2 h-2 text-green-500" />
                                                <span>Đang hoạt động</span>
                                            </>
                                        ) : (
                                            'Không hoạt động'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Khu vực tin nhắn - scrollable */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 p-5 flex flex-col gap-2 scroll-smooth bg-gray-50 dark:bg-gray-900"
                            id="chat-container"
                        >
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-primary dark:border-primary-dark border-t-transparent rounded-full animate-spin mb-3"></div>
                                        <p className="text-gray-500 dark:text-gray-400">Đang tải tin nhắn...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {hasMoreMessages && (
                                        <div className="flex justify-center mb-4 sticky z-10">
                                            <button
                                                onClick={loadMoreMessages}
                                                disabled={isLoadingMore}
                                                className="px-4 py-2 bg-white dark:bg-gray-800 text-primary dark:text-primary-dark rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                {isLoadingMore ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-primary dark:border-primary-dark border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Đang tải...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Xem thêm {Math.min(messages.length - visibleMessages, 30)} tin nhắn cũ hơn</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {displayedMessages.length > 0 ? displayedMessages.map((message, index) => {
                                        const isFirstInGroup = index === 0 || displayedMessages[index - 1].sender !== message.sender;
                                        const isLastInGroup = index === displayedMessages.length - 1 || displayedMessages[index + 1].sender !== message.sender;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'owner' ? 'justify-end' : 'justify-start'} 
                                                    ${!isLastInGroup ? 'mb-0.5' : 'mb-3'}`}
                                            >
                                                {message.sender !== 'owner' && isFirstInGroup && (
                                                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                                                        <img
                                                            src={selectedCustomer.avatar}
                                                            alt={selectedCustomer.name}
                                                            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                                                        />
                                                    </div>
                                                )}
                                                {message.sender !== 'owner' && !isFirstInGroup && (
                                                    <div className="w-8 h-8 mr-2 flex-shrink-0"></div>
                                                )}
                                                <div
                                                    className={`max-w-[75%] px-4 py-2.5 ${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-md'} 
                                                        ${isLastInGroup ? 'rounded-b-2xl' : 'rounded-b-md'}
                                                        ${message.sender === 'owner' ?
                                                            `${isFirstInGroup ? 'rounded-tr-sm' : 'rounded-tr-md'} bg-primary dark:bg-primary-dark text-white shadow-sm` :
                                                            `${isFirstInGroup ? 'rounded-tl-sm' : 'rounded-tl-md'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm`}`}
                                                >
                                                    {(() => {
                                                        const { hasImages, content } = parseMessageContent(message.text);

                                                        return content.map((item, idx) => (
                                                            <div key={idx}>
                                                                {item.type === 'image' ? (
                                                                    <div className={`${idx > 0 ? 'mt-2' : ''} ${idx < content.length - 1 ? 'mb-2' : ''}`}>
                                                                        <img
                                                                            src={item.url}
                                                                            alt="Hình ảnh"
                                                                            className="rounded-lg max-h-60 w-auto cursor-pointer hover:opacity-95 transition-opacity"
                                                                            onClick={() => window.open(item.url, '_blank')}
                                                                            onLoad={() => {
                                                                                const container = document.getElementById('chat-container');
                                                                                if (container && container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
                                                                                    container.scrollTop = container.scrollHeight;
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm whitespace-pre-wrap break-words">{item.content}</p>
                                                                )}
                                                            </div>
                                                        ));
                                                    })()}

                                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 
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
                                            </div>
                                        );
                                    }) : (
                                        <div className="flex items-center justify-center h-full text-center">
                                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm max-w-md">
                                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <FaRegSmile className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                    Chưa có tin nhắn nào
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Bắt đầu cuộc trò chuyện với khách hàng!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="h-2" />
                                </>
                            )}

                            {showScrollButton && (
                                <button
                                    onClick={scrollToBottom}
                                    className="absolute bottom-28 right-1/3 bg-primary dark:bg-primary-dark text-white p-2.5 rounded-full shadow-lg hover:bg-primary-dark dark:hover:bg-primary-light transition-colors z-10"
                                >
                                    <FaArrowDown />
                                </button>
                            )}
                        </div>

                        {/* Selected images preview */}
                        {selectedImages.length > 0 && (
                            <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex overflow-x-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent gap-3 flex-shrink-0">
                                {selectedImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Selected ${index}`}
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                                        />
                                        <button
                                            onClick={() => removeSelectedImage(index)}
                                            className="absolute -top-2 -right-2 bg-gray-700 dark:bg-gray-900 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 dark:hover:bg-red-500"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input message bar - fixed height */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-end gap-3">
                                <div className="relative flex-1">
                                    <textarea
                                        className="w-full px-5 py-3 pr-14 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-all resize-none max-h-32 min-h-[44px] shadow-inner"
                                        placeholder="Nhập tin nhắn..."
                                        rows={Math.min(3, Math.max(1, newMessage.split('\n').length))}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    ></textarea>

                                    {/* Emoji picker button */}
                                    <div className="absolute right-3 bottom-1/2 transform translate-y-1/2">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="p-2 text-gray-500 hover:text-primary dark:hover:text-primary-dark rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            title="Chèn biểu tượng cảm xúc"
                                        >
                                            <FaRegSmile className="text-xl" />
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 right-0 z-20 shadow-xl rounded-lg overflow-hidden">
                                                <EmojiPicker
                                                    onEmojiClick={handleEmojiClick}
                                                    width={300}
                                                    height={400}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                    className="p-3 text-gray-500 hover:text-primary dark:hover:text-primary-dark rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Tải ảnh lên"
                                >
                                    <FaImage className="text-xl" />
                                </button>

                                {/* Send button */}
                                <button
                                    onClick={() => handleSendMessage(newMessage, selectedImages)}
                                    disabled={!newMessage.trim() && selectedImages.length === 0}
                                    className={`p-3 rounded-full transition-all ${newMessage.trim() || selectedImages.length > 0
                                        ? 'bg-primary dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light'
                                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                    title="Gửi tin nhắn"
                                >
                                    <FaPaperPlane className="text-xl" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUser className="w-12 h-12 text-primary dark:text-primary-dark" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
                                Chưa chọn cuộc trò chuyện
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với khách hàng
                            </p>
                            <div className="w-20 h-1 bg-primary/30 dark:bg-primary-dark/30 mx-auto rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHomestay;