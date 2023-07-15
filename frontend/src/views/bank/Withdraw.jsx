import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useWithdrawMoneyMutation } from '../../slices/operationApiSlice';
import ConfirmOperationModal from '../../components/ConfirmOperationModal';
import amountFormat from '../../utils/amountFormat';
import GetAccount from '../../components/GetAccount';

const WithdrawMoney = () => {
  useCheckCookies();
  useSessionTimeout();
  const [account, setAccount] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [currency, setCurrency] = useState('$');
  const [amount, setAmount] = useState('');
  const [acronym, setAcronym] = useState('');
  const [withdrawMoney, { isLoading }] = useWithdrawMoneyMutation();
  const [accountFrom, setAccountFrom] = useState(null);
  const [operationDate, setOperationDate] = useState(null);
  const [amountFromData, setAmountFromData] = useState(null);
  const [amountToData, setAmountToData] = useState(null);
  const [tax, setTax] = useState(null);
  const [showModal, setShow] = useState(false);

  const handleData = (data) => {

    setAccountId(data._id);
    setCurrency(data.currency.symbol);
    setAcronym(data.currency.acronym);

    const acountFromData = data.type + data.currency.symbol + data.accountId.substring(3, 7) + ' - ' + data.accountId.substring(11, 21)
    setAccountFrom(acountFromData);
  };

  const handleCloseModal = () => {
    setShow(false);
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await withdrawMoney({ accountId, amount }).unwrap();
      toast.success(res.message);
      setOperationDate(res.date);
      setAmountFromData(res.amountTo);
      setAmountToData(res.amountFrom);
      setTax(res.tax);
      setShow(true);
      setAccount('');
      setAccountData(null);
      setAccountId(null);
      setAmount('');
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
                <h3 className='pb-0 mb-0'>Extracción</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form onSubmit={submitDeposit}>
              <Form.Group className='my-2' controlId='account'>
                <Form.Label className='fw-bold mb-0'>Cuenta a debitar:</Form.Label>
                <Form.Control type='text' className='form-control-edit-input rounded-0' placeholder='Ingrese alias o CBU a debitar' autoComplete='off' minLength={6}
                  maxLength={22} value={account} onChange={(e) => setAccount(e.target.value.toUpperCase())} onBlur={(e) => setAccountData(e.target.value)}></Form.Control>

                {accountData && (
                  <GetAccount dataAccount={account} onData={handleData} onError={() => { setAccountData(null); setAccountId(null); }} />
                )}
              </Form.Group>

              <Form.Group className='my-2' controlId='amount'>
                <Form.Label className='fw-bold mb-0'>Importe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{currency}</InputGroup.Text>
                  <Form.Control type='text' inputMode='decimal' placeholder='Ingrese importe' value={amount} onChange={(e) => setAmount(amountFormat(e.target.value))} disabled={!account} />
                </InputGroup>
              </Form.Group>

              <hr />

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='mb-3 ml-auto' disabled={!account || !amount}>
                  Extraer
                </Button>
              </div>
            </Form>
            {isLoading && <Loader />}
            {showModal && <ConfirmOperationModal state={showModal}
              type='Extracción'
              desc='debitado'
              date={operationDate}
              origin={accountFrom}
              destination={null}
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

export default WithdrawMoney;