import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const UserAccounts = ({ data, error }) => {
    const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            setCheckAccountsCompleted(true);
        }
    }, [data, error]);

    if (!checkAccountsCompleted) {
        return null;
    }

    const accounts = data?.accounts || [];
    const filteredAccounts = accounts.filter((account) => account.isActive);

    const options = filteredAccounts.map((account) => ({
        value: account._id,
        label: `${account.type} ${account.currency.symbol} ${account.accountId.substring(3, 7)} - ${account.accountId.substring(11, 21)}`,
        currency: `${account.currency.symbol}`,
        acronym: `${account.currency.acronym}`,
        balance: `${account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}`,
    }));

    return options;
}

export default UserAccounts;