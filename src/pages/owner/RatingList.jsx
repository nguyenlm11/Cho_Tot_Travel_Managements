import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaStar, FaFilter, FaReply, FaTrash, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import CountUp from 'react-countup';
import ratingAPI from '../../services/api/ratingAPI';

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    hover: {
        y: -5,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    }
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedScore, setSelectedScore, handleSearch, setActualSearchTerm, actualSearchTerm }) => {
    const searchInputRef = useRef(null);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
        setActualSearchTerm('');
        searchInputRef.current?.focus();
    };

    const scoreOptions = [
        { value: 'all', label: 'Tất cả đánh giá', icon: <FaFilter className="text-gray-400" /> },
        { value: '5', label: '5 sao', icon: <div className="flex"><FaStar className="text-yellow-400" /></div> },
        { value: '4', label: '4 sao', icon: <div className="flex"><FaStar className="text-yellow-400" /></div> },
        { value: '3', label: '3 sao', icon: <div className="flex"><FaStar className="text-yellow-400" /></div> },
        { value: '2', label: '2 sao', icon: <div className="flex"><FaStar className="text-yellow-400" /></div> },
        { value: '1', label: '1 sao', icon: <div className="flex"><FaStar className="text-yellow-400" /></div> }
    ];

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group flex">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Tìm kiếm theo tên khách hàng hoặc nội dung..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 pl-10 pr-[140px] py-3 rounded-l-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200
                            hover:border-primary/50 hover:shadow-md"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleSearchClear}
                            className="absolute right-[140px] top-1/2 -translate-y-1/2 p-1.5
                                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full
                                transition-all duration-200"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        className="px-6 bg-primary hover:bg-primary-dark text-white font-medium 
                            rounded-r-xl flex items-center gap-2 transition-all duration-200
                            hover:shadow-lg hover:shadow-primary/20 min-w-[120px] justify-center
                            border-l-0"
                    >
                        <FaSearch className="w-4 h-4" />
                        Tìm kiếm
                    </button>
                </div>

                {/* Score Filter */}
                <div className="relative min-w-[220px]">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FaStar className="text-yellow-400" />
                    </div>
                    <select
                        value={selectedScore}
                        onChange={(e) => setSelectedScore(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 
                            dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 
                            dark:text-gray-300 focus:ring-2 focus:ring-primary/20 
                            focus:border-primary transition-all duration-200
                            hover:border-primary/50 hover:shadow-md appearance-none cursor-pointer"
                    >
                        {scoreOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {(actualSearchTerm || selectedScore !== 'all') && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2"
                >
                    {actualSearchTerm && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            <FaSearch className="w-3 h-3" />
                            {actualSearchTerm}
                            <button
                                onClick={handleSearchClear}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                    {selectedScore !== 'all' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-primary/10 text-primary text-sm font-medium"
                        >
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            {selectedScore} sao
                            <button
                                onClick={() => setSelectedScore('all')}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full
                                    transition-colors duration-200"
                            >
                                <IoClose className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
};

const RatingCard = ({ rating, onReply, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (score) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={`w-5 h-5 ${index < score
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'}`}
            />
        ));
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden
                border border-gray-100 dark:border-gray-700
                transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <img
                                src={rating.userAvatar || 'https://via.placeholder.com/48'}
                                alt={rating.userName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {rating.userName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                {renderStars(rating.score)}
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                    {rating.score}/5
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(rating.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        {rating.comment}
                    </p>
                </div>

                {/* Images if any */}
                {rating.images && rating.images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {rating.images.map((image, index) => (
                            <div
                                key={index}
                                className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
                            >
                                <img
                                    src={image}
                                    alt={`Rating image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply section */}
                {rating.reply && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <FaReply className="text-primary" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Phản hồi từ chủ nhà
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {rating.reply}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex justify-end gap-2">
                    {!rating.reply && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onReply(rating)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg
                                hover:bg-primary hover:text-white transition-all duration-300"
                        >
                            <FaReply className="w-5 h-5" />
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(rating)}
                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg
                            hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        <FaTrash className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const RatingList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [selectedScore, setSelectedScore] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;
    const [ratingApi, setRatingApi] = useState([]);

    // Mock data
    const [ratings] = useState([
        {
            id: 1,
            userName: "Nguyễn Văn A",
            userAvatar: "https://i.pravatar.cc/150?img=1",
            score: 5,
            comment: "Phòng rất sạch sẽ, thoáng mát. Chủ nhà thân thiện, nhiệt tình. Sẽ quay lại lần sau!",
            createdAt: "2024-03-15T10:30:00",
            images: [
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a"
            ],
            reply: "Cảm ơn bạn đã để lại đánh giá tích cực. Rất mong được đón tiếp bạn trong những lần tới!"
        },
        {
            id: 2,
            userName: "Trần Thị B",
            userAvatar: "https://i.pravatar.cc/150?img=2",
            score: 4,
            comment: "Vị trí thuận tiện, gần trung tâm. Tuy nhiên wifi hơi yếu.",
            createdAt: "2024-03-14T15:45:00",
            images: [],
            reply: null
        },
    ]);

    const fetchRatingAPI = async () =>{
        try {
            const response = await ratingAPI.getRatingByHomestay(homestayId); 
            if(response.statusCode === 200){
                setRatingApi(response.data)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearch = () => {
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const filteredRatings = useMemo(() => {
        return ratings.filter(rating => {
            const matchesSearch = rating.userName.toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                rating.comment.toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesScore = selectedScore === 'all' || rating.score === parseInt(selectedScore);
            return matchesSearch && matchesScore;
        });
    }, [ratings, actualSearchTerm, selectedScore]);

    const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);
    const paginatedRatings = filteredRatings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleReply = (rating) => {
        console.log('Reply to rating:', rating);
    };

    const handleDelete = (rating) => {
        console.log('Delete rating:', rating);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [actualSearchTerm, selectedScore]);

    const averageRating = (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1);

    const statsData = [
        {
            label: 'Đánh giá trung bình',
            value: averageRating,
            icon: <FaStar className="w-6 h-6" />,
            gradient: 'from-yellow-500 to-yellow-600',
            iconBg: 'bg-yellow-400/20',
            suffix: '/5',
            decimals: 1
        },
        {
            label: 'Chưa phản hồi',
            value: ratings.filter(r => !r.reply).length,
            icon: <FaExclamationTriangle className="w-6 h-6" />,
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-400/20'
        },
        {
            label: 'Đã phản hồi',
            value: ratings.filter(r => r.reply).length,
            icon: <FaCheckCircle className="w-6 h-6" />,
            gradient: 'from-green-500 to-green-600',
            iconBg: 'bg-green-400/20'
        }
    ];

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen bg-gray-50 dark:bg-gray-900"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Đánh giá từ khách hàng
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý đánh giá và phản hồi khách hàng
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {statsData.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            className={`bg-gradient-to-r ${stat.gradient} 
                                rounded-xl p-6 transform transition-all duration-300 
                                hover:scale-105 hover:shadow-xl group`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${stat.iconBg} 
                                    transition-all duration-300 group-hover:bg-white/20`}>
                                    <motion.div
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">
                                        {stat.label}
                                    </p>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            delay: index * 0.2
                                        }}
                                        className="text-2xl font-bold text-white flex items-center"
                                    >
                                        <CountUp
                                            end={stat.value}
                                            duration={2}
                                            decimals={stat.decimals || 0}
                                            decimal="."
                                            separator=","
                                            delay={0.5}
                                            enableScrollSpy
                                            scrollSpyOnce
                                        >
                                            {({ countUpRef }) => (
                                                <span ref={countUpRef} />
                                            )}
                                        </CountUp>
                                        {stat.suffix && (
                                            <span className="ml-1">{stat.suffix}</span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Filter Bar */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
            >
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedScore={selectedScore}
                    setSelectedScore={setSelectedScore}
                    handleSearch={handleSearch}
                    setActualSearchTerm={setActualSearchTerm}
                    actualSearchTerm={actualSearchTerm}
                />
            </motion.div>

            {/* Ratings List */}
            <motion.div
                variants={{
                    initial: { opacity: 0 },
                    animate: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                initial="initial"
                animate="animate"
                className="space-y-6"
            >
                {paginatedRatings.map((rating) => (
                    <RatingCard
                        key={rating.id}
                        rating={rating}
                        onReply={handleReply}
                        onDelete={handleDelete}
                    />
                ))}
            </motion.div>

            {/* Empty State */}
            <AnimatePresence>
                {filteredRatings.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl
                                shadow-lg border border-gray-100 dark:border-gray-700 mt-8"
                    >
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <FaStar className="mx-auto w-16 h-16" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            Không tìm thấy đánh giá nào
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <FaChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`w-10 h-10 rounded-lg ${number === currentPage
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <FaChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default RatingList;
