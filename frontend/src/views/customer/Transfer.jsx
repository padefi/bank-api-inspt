import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useGetAccountQuery, useShowAccountsQuery } from '../../slices/accountApiSlice';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { useTransferMoneyMutation } from '../../slices/operationApiSlice';
import ConfirmOperationModal from '../../components/ConfirmOperationModal';
import UserAccounts from '../../utils/userAccounts';
import amountFormat from '../../utils/amountFormat';

const GetAccount = ({ dataAccountTo, onError }) => {
  const [checkAccountToCompleted, setCheckAccountToCompleted] = useState(false);
  const [isError, setIsError] = useState(false);
  const { data, error, isLoading, isFetching } = useGetAccountQuery({ data: dataAccountTo }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      setIsError(true);
      onError();
      toast.error(error.data?.message || error.error);
    } else {
      setIsError(false);
      setCheckAccountToCompleted(true);
    }
  }, [data, error]);

  if (isError) {
    return null;
  }

  if (!checkAccountToCompleted) {
    return null;
  }

  const account = data?.accounts || [];

  return (
    <>
      {isLoading || isFetching && <Loader />}
      <Form.Text className="text-muted">
        <div className='detail-account'>TITULAR: {account.accountHolder?.lastName?.toUpperCase()} {account.accountHolder?.firsName?.toUpperCase()}</div>
        <div className='detail-account'>{account.accountHolder?.governmentId?.type?.toUpperCase()}: {account.accountHolder?.governmentId?.number}</div>
      </Form.Text>
    </>
  );
}

const TransferMoney = () => {
  useCheckCookies();
  useSessionTimeout();
  const [accountId, setAccountId] = useState(null);
  const [accountTo, setAccountTo] = useState('');
  const [accountToData, setAccountToData] = useState(null);
  const [currency, setCurrency] = useState('$');
  const [acronym, setAcronym] = useState(null);
  const [accountBalance, setAccountBalance] = useState('$ 0,00');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferMoney, { isLoading }] = useTransferMoneyMutation();
  const { data, error, refetch } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });
  const options = UserAccounts({ data, error });
  const [accountFrom, setAccountFrom] = useState(null);
  const [operationDate, setOperationDate] = useState(null);
  const [destination, setDestination] = useState(null);
  const [amountFromData, setAmountFromData] = useState(null);
  const [amountToData, setAmountToData] = useState(null);
  const [tax, setTax] = useState(null);
  const [showModal, setShow] = useState(false);

  const selectStyles = () => ({
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });

  const clearAccountToData = () => {
    setAccountToData(null);
    setAmount('');
    setDescription('');
  };

  const defaultSelectValue = () => ({
    value: 0,
    label: "Seleccione una cuenta",
    currency: '$',
  });

  const handleCloseModal = () => {
    setShow(false);
  };

  const [selectedOptionKey, setSelectedOptionKey] = useState(0);

  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await transferMoney({ accountFromId: accountId, accountTo: accountToData, amount, description }).unwrap();
      toast.success(res.message);
      setOperationDate(res.date);
      setDestination(accountToData);
      setAmountFromData(res.amountFrom);
      setAmountToData(res.amountTo);
      setTax(res.tax);
      setShow(true);
      setSelectedOptionKey((prevKey) => prevKey + 1);
      setAccountId(null);
      setAccountBalance('$ 0,00');
      setAccountTo('');
      setAccountToData(null);
      setAmount('');
      setDescription('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <BoxContainer>
      <div className="d-flex justify-content-around">
        <CardContainer className="p-4" id="box-operation">
          <div className='box'>
            <div className='box mb-2'>
              <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
                <h3 className='pb-0 mb-0'>Transferencia</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form onSubmit={submitDeposit}>
              <Form.Group className='my-2'>
                <div className='fw-bold'>Cuenta a debitar</div>
                <Select key={selectedOptionKey} options={options} onChange={(option) => { setAccountId(option?.value || null); setAccountFrom(option?.label || null); setCurrency(option?.currency || '$'); setAcronym(option?.acronym || null); setAccountBalance(option?.balance || '$ 0,00'); }} styles={selectStyles}
                  menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
                <Form.Text className="text-muted">
                  <div className='detail-account'>Saldo: {accountBalance}</div>
                </Form.Text>
              </Form.Group>

              <Form.Group className='my-2' controlId='accountTo'>
                <Form.Label className='fw-bold mb-0'>Cuenta a acreditar</Form.Label>
                <Form.Control type='accountTo' className='form-control-edit-input rounded-0' placeholder='Ingrese alias o CBU a transferir' autoComplete='off' minLength={6} maxLength={22} value={accountTo} onChange={(e) => setAccountTo(e.target.value.toUpperCase())} onBlur={(e) => setAccountToData(e.target.value)}></Form.Control>

                {accountToData && (
                  <GetAccount dataAccountTo={accountToData} onError={clearAccountToData} />
                )}
              </Form.Group>

              <Form.Group className='my-2' controlId='amount'>
                <Form.Label className='fw-bold mb-0'>Importe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{currency}</InputGroup.Text>
                  <Form.Control type='text' inputMode='decimal' placeholder='Ingrese importe' value={amount} onChange={(e) => setAmount(amountFormat(e.target.value))} disabled={!accountId || !accountToData} />
                </InputGroup>
              </Form.Group>

              <Form.Group className='my-2' controlId='description'>
                <Form.Label className='fw-bold mb-0'>Motivo</Form.Label>
                <Form.Control type='description' className='form-control-edit-input rounded-0' placeholder='Ingrese motivo' autoComplete='off' minLength={1} maxLength={50} value={description} onChange={(e) => setDescription(e.target.value.toUpperCase())}></Form.Control>
              </Form.Group>

              <hr />

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='mb-3 ml-auto' disabled={!accountId || !amount || !accountToData || !description}>
                  Transferir
                </Button>
              </div>
            </Form>
            {isLoading && <Loader />}
            {showModal && <ConfirmOperationModal state={showModal}
              type='Transferencia'
              desc='transferido'
              date={operationDate}
              origin={accountFrom}
              destination={destination}
              amountFromData={amountFromData}
              amountToData={amountToData}
              acronym={acronym}
              tax={tax}
              onCloseModal={handleCloseModal} />}
          </div>
        </CardContainer>
      </div>
      <br />
    </BoxContainer >
  );
};

export default TransferMoney;