import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        if (!role.includes(user?.role)) {
            if (user?.role === 'Staff') {
                navigate(`/owner/homestays/${user?.homeStayID}/dashboard`, { replace: true });
            } else if (user?.role === 'Owner') {
                navigate('/owner/homestays', { replace: true });
            } else if (user?.role === 'Admin') {
                navigate('/admin/dashboard', { replace: true });
            }
        }
        setLoading(false);
    }, [location, navigate, role]);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (loading) {
        // Or return a spinner/loading UI
        return null;
    }



    return children;
};


export default ProtectedRoute; 