import { useCheckCookiesQuery } from '../slices/authApiSlice';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { userMessage } from '../slices/authSlice';

const useCheckCookies = () => {
    const [checkCookiesCompleted, setCheckCookiesCompleted] = useState(false);
    const { isError } = useCheckCookiesQuery({}, { refetchOnMountOrArgChange: true });
    const dispatch = useDispatch();

    useEffect(() => {
        if (isError) {
            // Ocurrió un error en la solicitud de las cookies
            localStorage.removeItem('userInfo');
            dispatch(userMessage('exp'));
            window.location.href = '/login';
        } else {
            setCheckCookiesCompleted(true);
        }
    }, [isError]);

    return checkCookiesCompleted;
};

export default useCheckCookies;