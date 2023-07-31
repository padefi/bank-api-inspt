import { useEffect, useState } from "react";
import { useGetAccountQuery } from "../slices/accountApiSlice";
import { Form } from "react-bootstrap";
import Loader from "./Loader";
import { toast } from "react-toastify";

const GetAccount = ({ dataAccount, onData, onError }) => {
    const [checkAccountCompleted, setCheckAccountCompleted] = useState(false);
    const [isError, setIsError] = useState(false);
    const { data, error, isLoading, isFetching } = useGetAccountQuery({ data: dataAccount }, { refetchOnMountOrArgChange: true });

    useEffect(() => {
        if (error) {
            setIsError(true);
            onError();
            toast.error(error.data?.message || error.error);
        } else if (data) {
            onData(data.accounts);
            setIsError(false);
            setCheckAccountCompleted(true);
        }
    }, [data, error]);

    if (isError) {
        return null;
    }

    if (!checkAccountCompleted) {
        return null;
    }

    const account = data?.accounts || [];

    return (
        <>
            {isLoading || isFetching && <Loader />}
            <Form.Text className="text-muted">
                <div className='detail-account'>TITULAR: {account.accountHolder?.lastName?.toUpperCase()} {account.accountHolder?.firstName?.toUpperCase()}</div>
                <div className='detail-account'>{account.accountHolder?.governmentId?.type?.toUpperCase()}: {account.accountHolder?.governmentId?.number}</div>
            </Form.Text>
        </>
    );
}

export default GetAccount;