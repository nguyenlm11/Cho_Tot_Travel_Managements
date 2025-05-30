import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [transactionResult, setTransactionResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const processPaymentCallback = async () => {
            try {
                const vnpAmount = searchParams.get('vnp_Amount');
                if (!vnpAmount) {
                    setLoading(false);
                    setError('Không tìm thấy thông tin giao dịch');
                    return;
                }
                const params = {};
                console.log('params', params);
                for (const [key, value] of searchParams.entries()) {
                    if (key.startsWith('vnp_')) {
                        params[key] = value;
                    } else if (key.startsWith('Vnp_')) {
                        const normalizedKey = 'vnp_' + key.substring(4);
                        params[normalizedKey] = value;
                    }
                }
                const orderInfo = params.vnp_OrderInfo || '';
                let bookingId = '';
                const isRefund = orderInfo.includes('Refund') || params.vnp_TxnRef?.includes('Refund');
                if (orderInfo.includes('BookingID:')) {
                    const match = orderInfo.match(/BookingID:(\d+)/);
                    if (match && match[1]) {
                        bookingId = match[1];
                    }
                }
                if (!bookingId && params.vnp_TxnRef) {
                    const txnRef = params.vnp_TxnRef;
                    const match = txnRef.match(/H-(\d+)-/);
                    if (match && match[1]) {
                        bookingId = match[1];
                    }
                }
                await updatePaymentStatusOnBackend(params);
                setTransactionResult({
                    success: params.vnp_ResponseCode === '00',
                    amount: parseInt(params.vnp_Amount) / 100,
                    bookingId,
                    transactionId: params.vnp_TransactionNo,
                    isRefund,
                    message: params.vnp_ResponseCode === '00'
                        ? isRefund ? 'Hoàn tiền thành công!' : 'Thanh toán thành công!'
                        : isRefund ? 'Hoàn tiền không thành công!' : 'Thanh toán không thành công!'
                });
                if (params.vnp_ResponseCode === '00') {
                    toast.success(isRefund ? 'Hoàn tiền thành công!' : 'Thanh toán thành công!');
                } else {
                    toast.error(isRefund ? 'Hoàn tiền không thành công!' : 'Thanh toán không thành công!');
                }
            } catch (error) {
                console.error('Lỗi khi xử lý callback từ VNPay:', error);
                setError('Có lỗi xảy ra khi xử lý dữ liệu từ VNPay');
            } finally {
                setLoading(false);
            }
        };

        processPaymentCallback();
    }, [searchParams]);

    const updatePaymentStatusOnBackend = async (params) => {
        try {
            if (!params) return;
            const isRefund = params.vnp_OrderInfo?.includes('Refund') || params.vnp_TxnRef?.includes('Refund');
            const apiUrl = 'https://capstone-bookinghomestay.onrender.com/api/booking-checkout/vnpay-return-refunded'
            // const apiUrl = 'http://localhost:7221/api/booking-checkout/vnpay-return-refunded'

            const formattedParams = {};
            Object.keys(params).forEach(key => {
                if (key.startsWith('vnp_') || key.startsWith('Vnp_')) {
                    const normalizedKey = key.startsWith('vnp_') ? key : 'vnp_' + key.substring(4);
                    if (normalizedKey.toLowerCase() === 'vnp_amount' && !isNaN(params[key])) {
                        formattedParams[normalizedKey] = Number(params[key]);
                    } else {
                        formattedParams[normalizedKey] = params[key];
                    }
                } else {
                    formattedParams[key] = params[key];
                }
            });

            console.log(`Gửi params đến backend (${isRefund ? 'Hoàn tiền' : 'Thanh toán'}):`, formattedParams);

            try {
                const response = await axios.get(
                    apiUrl,
                    {
                        params: formattedParams,
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );
                console.log('Backend response:', response.data);
                return response.data;
            } catch (error) {
                console.error('Error updating backend:', error);
            }
        } catch (error) {
            console.error('Error in updatePaymentStatusOnBackend:', error);
        }
    };

    const handleBackToBookings = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        navigate('/admin/revenue/transactions');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center mb-4">Đang xử lý kết quả thanh toán...</h1>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Lỗi xử lý thanh toán</h1>
                    <p className="text-center text-gray-700 mb-6">{error}</p>
                    <div className="flex justify-center">
                        <button
                            onClick={handleBackToBookings}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Quay lại danh sách giao dịch
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                {transactionResult && transactionResult.success ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-center mb-2">
                                {transactionResult.isRefund ? 'Hoàn tiền thành công!' : 'Thanh toán thành công!'}
                            </h1>
                            <p className="text-gray-600">
                                {transactionResult.isRefund
                                    ? 'Yêu cầu hoàn tiền của bạn đã được xử lý thành công.'
                                    : 'Giao dịch của bạn đã được xử lý thành công.'}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-center mb-2">
                                {transactionResult && transactionResult.isRefund ? 'Hoàn tiền thất bại!' : 'Thanh toán thất bại!'}
                            </h1>
                            <p className="text-gray-600">
                                {transactionResult && transactionResult.isRefund
                                    ? 'Đã xảy ra lỗi khi xử lý yêu cầu hoàn tiền của bạn.'
                                    : 'Đã xảy ra lỗi khi xử lý giao dịch thanh toán của bạn.'}
                            </p>
                        </div>
                    </>
                )}

                <div className="border-t border-b py-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Mã giao dịch:</span>
                        <span>{searchParams.get('vnp_TxnRef')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Số tiền:</span>
                        <span>{parseInt(searchParams.get('vnp_Amount') || '0') / 100} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Ngân hàng:</span>
                        <span>{searchParams.get('vnp_BankCode')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Thời gian:</span>
                        <span>{searchParams.get('vnp_PayDate')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Nội dung:</span>
                        <span>{searchParams.get('vnp_OrderInfo')}</span>
                    </div>
                    {searchParams.get('vnp_ResponseCode') !== '00' && (
                        <div className="flex justify-between">
                            <span className="font-medium">Mã lỗi:</span>
                            <span>{searchParams.get('vnp_ResponseCode')}</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleBackToBookings}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Quay lại danh sách giao dịch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback; 