import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUserRoleQuery } from '../slices/authApiSlice';

const PrivateRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

const PrivateRouteClient = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'cliente' ? children : <Outlet />;
};

const PrivateRouteAdmin = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'admin' ? children : <Navigate to='/bank/dashboard' replace />;
};

const PrivateRouteEmployeeAdmin = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'empleado' || data?.role === 'admin' ? children : <Navigate to='/bank/dashboard' replace />;
};

export {
    PrivateRoute,
    PrivateRouteClient,
    PrivateRouteAdmin,
    PrivateRouteEmployeeAdmin,
}