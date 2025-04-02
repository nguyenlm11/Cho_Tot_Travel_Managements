import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaQrcode, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import QrScanner from "qr-scanner";

const QRScannerModal = ({ onClose, onScanSuccess }) => {
    const videoRef = useRef(null);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [scanner, setScanner] = useState(null);
    const [scannerKey, setScannerKey] = useState(0);

    const initScanner = () => {
        if (!videoRef.current) return;
        if (scanner) {
            scanner.stop();
            setScanner(null);
        }
        const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
                const qrData = result.data;
                setScanResult(qrData);
                setIsScanning(false);
                const bookingId = extractBookingId(qrData);
                if (bookingId) {
                    onScanSuccess?.(bookingId);
                } else {
                    setError('Mã QR không hợp lệ: Không tìm thấy ID đặt phòng');
                }
                qrScanner.stop();
            },
            {
                returnDetailedScanResult: true,
                highlightScanRegion: true,
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
            }
        );
        setScanner(qrScanner);
        qrScanner.start().catch((err) => {
            console.error('Error starting camera:', err);
            setError(`Không thể khởi động camera: ${err.message}`);
        });
    };

    useEffect(() => {
        initScanner();
        return () => {
            if (scanner) {
                scanner.stop();
            }
        };
    }, [scannerKey]);

    const extractBookingId = (qrData) => {
        try {
            const urlParams = new URLSearchParams(new URL(qrData).search);
            const bookingId = urlParams.get("bookingId");
            if (bookingId) return bookingId;
        } catch (e) {
            console.log(e);
        }
        if (/^\d+$/.test(qrData)) {
            return qrData;
        }
        try {
            const parsedData = JSON.parse(qrData);
            if (parsedData.bookingId) return parsedData.bookingId;
        } catch (e) {
            console.log(e);
        }
        return null;
    };

    const handleRescan = () => {
        if (scanner) {
            scanner.stop();
            setScanner(null);
        }
        setScanResult(null);
        setError(null);
        setIsScanning(true);
        setScannerKey(prevKey => prevKey + 1);
        setTimeout(() => { initScanner() }, 100);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl backdrop-saturate-150"
                >
                    {/* Header */}
                    <motion.div
                        className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                    >
                        <div className="flex justify-between items-center">
                            <motion.h2
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent flex items-center gap-2"
                            >
                                <FaQrcode className="text-primary" />
                                QR Check-in
                            </motion.h2>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            >
                                <FaTimes className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="p-6 space-y-6">
                        {isScanning ? (
                            <div className="relative">
                                <div className="aspect-video overflow-hidden rounded-xl relative bg-black">
                                    <video
                                        key={scannerKey}
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 border-2 border-white/30"></div>
                                        <div className="absolute left-1/4 top-1/4 right-1/4 bottom-1/4 border-2 border-primary animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                                    <p>Đưa mã QR vào khung hình để quét</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl">
                                {error ? (
                                    <div className="text-center">
                                        <FaExclamationTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                                        <h3 className="text-xl font-semibold text-red-500 mb-2">Quét không thành công</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                                        <button
                                            onClick={handleRescan}
                                            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                                        >
                                            Quét lại
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <FaCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                        <h3 className="text-xl font-semibold text-green-500 mb-2">Quét thành công</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Mã QR đã được xử lý. Hệ thống đang tiến hành check-in.
                                        </p>
                                        <button
                                            onClick={handleRescan}
                                            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
                                        >
                                            <FaQrcode className="w-4 h-4" />
                                            <span>Quét tiếp</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QRScannerModal;
