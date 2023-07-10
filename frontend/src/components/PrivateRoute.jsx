import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useUserRoleQuery } from '../slices/authApiSlice';

const PrivateRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

const PrivateRouteClient = () => {
    const { data } = useUserRoleQuery();
    return data?.role === 'cliente' ? <Outlet /> : <Navigate to='/home' replace />;
};

const PrivateRouteEmployee = () => {
    const { data } = useUserRoleQuery();
    return data?.role === 'empleado' ? <Outlet /> : <Navigate to='/home' replace />;
};

const PrivateRouteAdmin = () => {
    const { data } = useUserRoleQuery();
    return data?.role === 'admin' ? <Outlet /> : <Navigate to='/home' replace />;
};

const PrivateRouteEmployeeAdmin = () => {
    const { data } = useUserRoleQuery();
    return data?.role === 'empleado' || data?.role === 'admin' ? <Outlet /> : <Navigate to='/home' replace />;
};

export {
    PrivateRoute,
    PrivateRouteClient,
    PrivateRouteEmployee,
    PrivateRouteAdmin,
    PrivateRouteEmployeeAdmin,
}