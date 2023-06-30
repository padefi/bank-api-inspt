import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logout, userMessage } from '../slices/authSlice';
import { useLogoutMutation } from "../slices/usersApiSlice";
import { useDispatch } from "react-redux";

function useSessionTimeout() {
    const location = useLocation();
    const dispatch = useDispatch();
    const [logoutApiCall] = useLogoutMutation();

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                await logoutApiCall().unwrap();
                dispatch(logout());
                dispatch(userMessage('exp'));
            } catch (err) {
                console.error(err);
            }
        }, 10 * 60_000);

        return () => clearTimeout(timer);
    }, [location]);
}

export default useSessionTimeout;