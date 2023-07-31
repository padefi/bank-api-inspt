import React, { useEffect, useState } from 'react';
import { useActiveAccountMutation, useCloseAccountMutation, useGetCurrenciesQuery, useShowAllAccountsQuery } from '../../slices/accountApiSlice';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaRegCheckCircle, FaShareSquare, FaTimes } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import UserRole from "../../utils/userRole";

const AccountTypeOptions = () => {
    const options = [
        { value: '', label: 'TODAS' },
        { value: 'CA', label: 'CAJA DE AHORRO' },
        { value: 'CC', label: 'CUENTA CORRIENTE' }
    ]

    return options;
}

const CurrenciesOptions = ({ accountType, selectStyles, setCurrencyId, currencyId }) => {
    const [getCurrenciesCompleted, setGetCurrenciesCompleted] = useState(false);
    const { data, error } = useGetCurrenciesQuery({}, { refetchOnMountOrArgChange: true });

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            setGetCurrenciesCompleted(true);
        }
    }, [data, error]);

    if (!getCurrenciesCompleted) {
        return null;
    }

    const currencies = data?.currency || [];
    const filteredCurrencies = accountType === 'CC' ? currencies.filter(currency => currency.acronym !== 'USD') : currencies;

    let options = filteredCurrencies.map((currency) => ({
        value: `${currency._id}`,
        label: `${currency.symbol} - ${currency.name.toUpperCase()}`,
    }));

    /* if (accountType === 'CA' || accountType === null) { */
    options = [{ value: '', label: 'TODAS' }, ...options];
    /* } */

    return (
        <Select key={accountType} options={options} onChange={(option) => setCurrencyId(option?.value || null)} styles={selectStyles} menuPortalTarget={document.body} defaultValue={options[0]} />
    );
}

const AllCustomersAccounts = () => {
    useCheckCookies();
    useSessionTimeout();
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState(null);
    const [currencyId, setCurrencyId] = useState(null);
    const [governmentId, setGovernmentId] = useState('');
    const [dataAccount, setDataAccount] = useState('');
    const accountTypeOptions = AccountTypeOptions();
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
    const { data, error, isLoading, isFetching, refetch } = useShowAllAccountsQuery({ accountType, currencyId, governmentId, dataAccount }, { refetchOnMountOrArgChange: true });
    const [pageNumber, setPageNumber] = useState(1);
    const itemsPerPage = 10;
    const [closeAccount, { isLoading: isLoadingCloseAccount }] = useCloseAccountMutation();
    const [activeAccount, { isLoading: isLoadingActiveAccount }] = useActiveAccountMutation();
    const dataRole = UserRole();

    const isAdmin = dataRole?.role === 'admin';

    const handleAdvancedSearch = () => {
        setAdvancedSearch(!advancedSearch);
    };

    const selectStyles = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '12px',
            width: '250px',
        }),
    };

    const handleAdvanced = () => {
        refetch();
    };

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            setCheckAccountsCompleted(true);
        }
    }, [data, error]);

    useEffect(() => {
        setCurrencyId(null);
    }, [accountType]);

    if (!checkAccountsCompleted) {
        return null;
    }

    const handleNextPage = () => {
        const totalPages = Math.ceil(data?.accounts?.length / itemsPerPage);
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleCloseAccount = async (e, accountId) => {
        e.preventDefault();
        try {
            const res = await closeAccount({ accountId }).unwrap();
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleActiveAccount = async (e, accountId) => {
        e.preventDefault();
        try {
            const res = await activeAccount({ accountId }).unwrap();
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleClickOperation = (accountId) => {
        navigate(`/bank/accountOperations/${accountId}`);
    };

    const handleClickBankOperation = () => {
        navigate(`/bank/accountBankOperations`);
    };

    const accounts = data?.accounts || [];
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    return (
        <div className='box'>
            <div className="d-flex justify-content-around mt-5">
                <CardContainer id="BankCardContainer">
                    <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
                        <h2 className='card-title'>Cuentas</h2>
                    </div>
                    {isLoading || isFetching && <Loader />}
                    <div className='box-details'>
                        <div className='box button-container mt-1 px-2 pb-2 pt-1' id='button-container'>
                            <div className='box d-flex justify-content-center'>
                                <Button variant="primary" size="sm" className="detail-button" onClick={handleAdvancedSearch}>
                                    <span>Busqueda avanzada</span>
                                </Button>
                            </div>
                            {isAdmin && (
                                <div className='box d-flex justify-content-end'>
                                    <Button to="/customer/" variant="outline-primary" className="btn btn-custom d-flex align-items-center" size='sm' title="Ver operaciones"  onClick={() => handleClickBankOperation()}>
                                        <span className="plus-icon"><FaShareSquare className='me-2' /></span>
                                        <p className='mb-0 txt-btn-default'>CC del banco</p>
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className={`box advanced-search d-flex justify-content-center mb-2 ${advancedSearch ? 'advanced-search-visible' : 'advanced-search-hidden'}`}>
                            <Row className='justify-content-center'>
                                <Col>
                                    <div className='box d-flex justify-content-between'>
                                        <Form.Group className='mr-2 mb-2 flex-grow-1'>
                                            <Form.Label htmlFor="governmentId" className='fw-bold detail-text'>Titular/Documento:</Form.Label>
                                            <Form.Control id="governmentId" type="text" className="form-control form-control-sm" value={governmentId} onChange={(e) => { setGovernmentId(e.target.value.toUpperCase()); handleAdvanced; }} />
                                        </Form.Group>
                                        <Form.Group className='flex-grow-1'>
                                            <Form.Label htmlFor="dataAccount" className='fw-bold detail-text'>CBU/Alias:</Form.Label>
                                            <Form.Control id="dataAccount" type="text" className="form-control form-control-sm" value={dataAccount} onChange={(e) => { setDataAccount(e.target.value.toUpperCase()); handleAdvanced; }} />
                                        </Form.Group>
                                    </div>
                                    <div className='box d-flex justify-content-between'>
                                        <Form.Group className='flex-grow-1 mr-1'>
                                            <div className='fw-bold detail-text'>Tipo de cuenta:</div>
                                            <Select options={accountTypeOptions} onChange={(accountTypeOptions) => { setAccountType(accountTypeOptions?.value || null); handleAdvanced; }} styles={selectStyles}
                                                menuPortalTarget={document.body} defaultValue={accountTypeOptions[0]} />
                                        </Form.Group>
                                        <Form.Group className='flex-grow-1 ml-1'>
                                            <div className='fw-bold detail-text'>Tipo de moneda:</div>
                                            <CurrenciesOptions accountType={accountType} selectStyles={selectStyles} setCurrencyId={setCurrencyId} currencyId={currencyId} />
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <Table striped bordered hover className='mb-0 detail-table'>
                            <thead>
                                <tr>
                                    <th>Tipo - N° de cuenta</th>
                                    <th>Titular</th>
                                    <th>Datos</th>
                                    <th>Saldo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            {paginatedAccounts.length > 0 ? (
                                <tbody>
                                    {paginatedAccounts.map((account) => (
                                        <tr key={account._id}>
                                            <td>{account.type} {account.currency.symbol} - {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}</td>
                                            <td>
                                                <div className='box'>
                                                    <div><strong>TITULAR: </strong>{account.accountHolder.lastName.toUpperCase()} {account.accountHolder.firstName.toUpperCase()}</div>
                                                    <div><strong>{account.accountHolder.governmentId.type.toUpperCase()}: </strong>{account.accountHolder.governmentId.number}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className='box'>
                                                    <div><strong>CBU: </strong>{account.accountId}</div>
                                                    <div><strong>ALIAS: </strong>{account.alias}</div>
                                                </div>
                                            </td>
                                            <td>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
                                            <td>{account.isActive ? (`Activa`) : (`Baja`)}</td>
                                            <td>
                                                <div className='box d-flex justify-content-center'>
                                                    <Button variant="outline-primary" title="Ver operaciones" size="sm" className='mr-2' onClick={() => handleClickOperation(account._id)}><FaShareSquare /></Button>
                                                    {account.isActive ? (
                                                        <>
                                                            <Button variant="outline-danger" title="Cerrar cuenta" size="sm" onClick={(e) => handleCloseAccount(e, account._id)}><FaTimes /></Button>
                                                            {isLoadingCloseAccount && <Loader />}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button to="/client/" variant="outline-success" title="Activar cuenta" className="btn btn-custom d-flex align-items-center" onClick={(e) => handleActiveAccount(e, account._id)}><FaRegCheckCircle /></Button>
                                                            {isLoadingActiveAccount && <Loader />}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan={6}><h5 className="h-striped">No se encontraron cuentas</h5></td>
                                    </tr>
                                </tbody>
                            )}
                        </Table>
                    </div>
                    <div className="box mt-2 text-center mb-1">
                        <Button variant="outline-primary" onClick={handlePreviousPage} disabled={pageNumber === 1} size='sm' className='mr-2'><FaArrowLeft /></Button>
                        <Button variant="outline-primary" onClick={handleNextPage} disabled={pageNumber === Math.ceil(accounts.length / itemsPerPage)} size='sm'><FaArrowRight /></Button>
                    </div>
                </CardContainer>
            </div>
        </div>
    );
};

export default AllCustomersAccounts;