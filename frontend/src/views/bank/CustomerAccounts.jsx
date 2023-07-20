import React, { useEffect, useState } from 'react';
import { useActiveAccountMutation, useCloseAccountMutation, useCreateAccountMutation, useGetCurrenciesQuery, useGetCustomerAccountsQuery } from '../../slices/accountApiSlice';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaPlusCircle, FaRegCheckCircle, FaShareSquare, FaTimes } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

const AccountTypeOptions = () => {
  const options = [
    { value: 'CA', label: 'CAJA DE AHORRO' },
    { value: 'CC', label: 'CUENTA CORRIENTE' }
  ]

  return options;
}

const CurrenciesOptions = ({ accountType, selectStyles, defaultSelectValueCurrency, setCurrencyId }) => {
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

  const options = filteredCurrencies.map((currency) => ({
    value: `${currency._id}`,
    label: `${currency.symbol} - ${currency.name.toUpperCase()}`,
  }));

  return (
    <Select key={accountType} options={options} onChange={(option) => setCurrencyId(option?.value || null)} styles={selectStyles} defaultValue={defaultSelectValueCurrency} />
  );
}

const CustomerAccounts = () => {
  useCheckCookies();
  useSessionTimeout();
  const { id } = useParams();
  const [showModal, setShow] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [currencyId, setCurrencyId] = useState(null);
  const [selectedOptionKeyAccountType, setSelectedOptionKeyAccountType] = useState(0);
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const [createAccount, { isLoading: isLoadingCreateAccount }] = useCreateAccountMutation();
  const [closeAccount, { isLoading: isLoadingCloseAccount }] = useCloseAccountMutation();
  const [activeAccount, { isLoading: isLoadingActiveAccount }] = useActiveAccountMutation();
  const { data, error, isLoading, isFetching, refetch } = useGetCustomerAccountsQuery({ id: id }, { refetchOnMountOrArgChange: true });
  const accountTypeOptions = AccountTypeOptions();
  const navigate = useNavigate();

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

  const selectStylesModal = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    control: (provided) => ({
      ...provided,
      fontSize: '12px',
    }),
  };

  const defaultSelectValueAccountType = () => ({
    value: 0,
    label: "Seleccione un tipo de cuenta"
  });

  const defaultSelectValueCurrency = () => ({
    value: 0,
    label: "Seleccione un tipo de moneda"
  });

  const handleButtonOpenModal = () => {
    setAccountType(null);
    setCurrencyId(null);
    setShow(true);
  }

  const handleCloseModal = () => setShow(false);

  const submitNewAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await createAccount({ userId: id, accountType, currencyId }).unwrap();
      toast.success(res.message);
      setShow(false);
      setSelectedOptionKeyAccountType((prevKey) => prevKey + 1);
      setAccountType(null);
      setCurrencyId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const accounts = data?.accounts || [];

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
              <div className='box d-flex justify-content-end'>
                <Button to="/customer/" variant="outline-primary" className="btn btn-custom d-flex align-items-center" size='sm' onClick={handleButtonOpenModal}>
                  <span className="plus-icon"><FaPlusCircle className='me-2' /></span>
                  <p className='mb-0 txt-btn-default'>Nueva Cuenta</p>
                </Button>
              </div>
            </div>
            <Table striped bordered hover className='mb-0 detail-table'>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>N° de cuenta</th>
                  <th>Datos</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {accounts.length > 0 ? (
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account._id}>
                      <td>{account.type} {account.currency.symbol}</td>
                      <td>{account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}</td>
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
        </CardContainer>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Form onSubmit={submitNewAccount}>
          <Modal.Header closeButton className='bg-dark text-white justify-content-center'>
            <Modal.Title>Nueva Cuenta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='my-2' controlId='accountType'>
              <h6>Tipo de Cuenta</h6>
              <Select key={selectedOptionKeyAccountType} options={accountTypeOptions} onChange={(option) => setAccountType(option?.value || null)} styles={selectStylesModal} defaultValue={defaultSelectValueAccountType} />
            </Form.Group>

            {accountType && (
              <Form.Group className='my-2' controlId='currencyId'>
                <h6>Tipo de Moneda</h6>
                <CurrenciesOptions accountType={accountType} selectStyles={selectStylesModal} defaultSelectValueCurrency={defaultSelectValueCurrency} setCurrencyId={setCurrencyId} />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type='submit' variant='success' disabled={!accountType || !currencyId}>
              Confirmar
            </Button>
          </Modal.Footer>
        </Form>
        {isLoadingCreateAccount && <Loader />}
      </Modal>
    </div>
  );
};

export default CustomerAccounts;