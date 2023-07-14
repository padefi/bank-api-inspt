import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUserRoleQuery } from '../slices/authApiSlice';

const PrivateRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

const PrivateRouteCustomer = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'cliente' ? children : <Outlet />;
};

const PrivateRouteAdmin = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'admin' ? children : <Outlet />;
};

const PrivateRouteEmployeeAdmin = ({ children }) => {
    const { data } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    return data?.role === 'empleado' || data?.role === 'admin' ? children : <Outlet />;
};

export {
    PrivateRoute,
    PrivateRouteCustomer,
    PrivateRouteAdmin,
    PrivateRouteEmployeeAdmin,
}