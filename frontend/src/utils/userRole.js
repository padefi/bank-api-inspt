import { useEffect } from "react";
import { useUserRoleQuery } from "../slices/authApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { userMessage } from "../slices/authSlice";

const UserRole = () => {
    const { userInfo } = useSelector((state) => state.auth);
    if (!userInfo) return null;

    const { data, error } = useUserRoleQuery({}, { refetchOnMountOrArgChange: true });
    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            localStorage.removeItem('userInfo');
            dispatch(userMessage('exp'));
            window.location.href = '/login';
        }
    }, [data, error, dispatch, userInfo]);

    return data;
}

export default UserRole;