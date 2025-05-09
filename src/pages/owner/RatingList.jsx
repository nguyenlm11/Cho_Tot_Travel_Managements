import React, { useState, useRef, useEffect, useMemo, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaStar, FaFilter, FaReply, FaTrash, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import CountUp from 'react-countup';
import ratingAPI from '../../services/api/ratingAPI';
import { useParams } from 'react-router-dom';


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

const RatingCard = ({ rating }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timePart = date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return `${timePart}, ${datePart}`;
    };
    return (
        <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="">
                <div className="py-3 px-6 border rounded-2xl dark:border-gray-800 bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-primary shadow">
                                <img
                                    src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGecVsI8KWwGOkEA0gZ4GSwySCMq2dgtRE6RKPlzhpQleNn9nH9aC5CHPGlAcd1AzNuDI&usqp=CAU'}
                                    alt={rating?.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {rating?.username || "Ẩn danh"}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <svg key={i} className={`w-5 h-5 ${i <= Math.round(rating?.sumRate) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <polygon points="9.9,1.1 12.3,6.6 18.2,7.3 13.7,11.3 15,17.1 9.9,14.1 4.8,17.1 6.1,11.3 1.6,7.3 7.5,6.6 " />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                        {rating?.sumRate ? `${rating.sumRate.toFixed(1)}/5` : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 italic">
                                {formatDate(rating?.updatedAt)}
                            </span>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-base">
                            {rating?.content || "Không có nội dung đánh giá"}
                        </p>
                    </div>
                    {/* Images if any */}
                    {rating?.imageRatings && rating.imageRatings.length > 0 && (
                        <div className="flex gap-3 mb-2 overflow-x-auto pb-2">
                            {rating?.imageRatings?.map((image, index) => (
                                <div
                                    key={index}
                                    className="w-[300px] h-[250px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                >
                                    <img
                                        src={image?.image}
                                        alt={`Rating image ${index + 1}`}
                                        className="w-full max-h-[300px] object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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
    // const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;
    const [ratingApi, setRatingApi] = useState({ item1: [] });
    const { id: homestayId } = useParams();
    const [averageRatings, setAverageRatings] = useState({
        averageRating: 0,
        cleanlinessRating: 0,
        serviceRating: 0,
        facilityRating: 0
    });

    useEffect(() => {
        fetchRatingAPI();
    }, []);

    const fetchRatingAPI = async () => {
        try {
            const response = await ratingAPI.getRatingByHomestay(homestayId);
            if (response.statusCode === 200) {
                setRatingApi(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Map API data to UI data
    const mappedRatings = useMemo(() => {
        if (!ratingApi?.item1) return [];
        return ratingApi.item1.map(rating => ({
            ...rating,
            // Nếu cần map lại trường, làm ở đây
        }));
    }, [ratingApi]);

    const filteredRatings = useMemo(() => {
        return mappedRatings.filter(rating => {
            const matchesSearch = (rating.username || '').toLowerCase().includes(actualSearchTerm.toLowerCase()) ||
                (rating.content || '').toLowerCase().includes(actualSearchTerm.toLowerCase());
            const matchesScore = selectedScore === 'all' || Math.round(rating.sumRate) === parseInt(selectedScore);
            return matchesSearch && matchesScore;
        });
    }, [mappedRatings, actualSearchTerm, selectedScore]);

    const totalPages = Math.ceil(filteredRatings.length / itemsPerPage);
    const paginatedRatings = filteredRatings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [actualSearchTerm, selectedScore]);

    useEffect(() => {
        if (ratingApi?.item1 && ratingApi.item1.length > 0) {
            const total = ratingApi.item1.reduce((acc, curr) => ({
                sumRate: acc.sumRate + curr.sumRate,
                cleaningRate: acc.cleaningRate + curr.cleaningRate,
                serviceRate: acc.serviceRate + curr.serviceRate,
                facilityRate: acc.facilityRate + curr.facilityRate
            }), {
                sumRate: 0,
                cleaningRate: 0,
                serviceRate: 0,
                facilityRate: 0
            });

            const count = ratingApi.item1.length;
            setAverageRatings({
                averageRating: total.sumRate / count,
                cleanlinessRating: total.cleaningRate / count,
                serviceRating: total.serviceRate / count,
                facilityRating: total.facilityRate / count
            });
        }
    }, [ratingApi]);

    // useEffect(() => {
    //     console.log("Rating API Data:", ratingApi);
    // }, [ratingApi]);

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    {/* Đánh giá trung bình */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-yellow-400/20 transition-all duration-300 group-hover:bg-white/20">
                                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }}>
                                    <FaStar className="w-6 h-6" />
                                </motion.div>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Đánh giá trung bình</p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className="text-2xl font-bold text-white flex items-center"
                                >
                                    <CountUp
                                        end={averageRatings.averageRating}
                                        duration={2}
                                        decimals={1}
                                        suffix="/5"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Đánh giá sạch sẽ */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-red-400/20 transition-all duration-300 group-hover:bg-white/20">
                                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }}>
                                    <FaStar className="w-6 h-6" />
                                </motion.div>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Đánh giá sạch sẽ</p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className="text-2xl font-bold text-white flex items-center"
                                >
                                    <CountUp
                                        end={averageRatings.cleanlinessRating}
                                        duration={2}
                                        decimals={1}
                                        suffix="/5"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Đánh giá dịch vụ */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-400/20 transition-all duration-300 group-hover:bg-white/20">
                                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }}>
                                    <FaStar className="w-6 h-6" />
                                </motion.div>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Đánh giá dịch vụ</p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className="text-2xl font-bold text-white flex items-center"
                                >
                                    <CountUp
                                        end={averageRatings.serviceRating}
                                        duration={2}
                                        decimals={1}
                                        suffix="/5"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Đánh giá cơ sở vật chất */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gray-400/20 transition-all duration-300 group-hover:bg-white/20">
                                <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }}>
                                    <FaStar className="w-6 h-6" />
                                </motion.div>
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Đánh giá cơ sở vật chất</p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className="text-2xl font-bold text-white flex items-center"
                                >
                                    <CountUp
                                        end={averageRatings.facilityRating}
                                        duration={2}
                                        decimals={1}
                                        suffix="/5"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
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
                    handleSearch={() => {
                        setActualSearchTerm(searchTerm);
                        setCurrentPage(1);
                    }}
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
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                initial="initial"
                animate="animate"
                className="space-y-6"
            >
                {paginatedRatings.map((rating) => (
                    <RatingCard
                        key={rating.ratingID}
                        rating={rating}
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
                        className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8"
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
