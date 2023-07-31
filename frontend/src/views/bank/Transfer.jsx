import React, { useState } from 'react';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { Button, Form, InputGroup } from 'react-bootstrap';
import ConfirmOperationModal from '../../components/ConfirmOperationModal';
import amountFormat from '../../utils/amountFormat';
import GetAccount from '../../components/GetAccount';
import { useTransferMoneyMutation } from '../../slices/operationApiSlice';

const CustomerTransferMoney = () => {
  useCheckCookies();
  useSessionTimeout();
  const [accountF, setAccountF] = useState('');
  const [accountFromData, setAccountFromData] = useState(null);
  const [accountFromId, setAccountFromId] = useState(null);
  const [accountT, setAccountT] = useState('');
  const [accountToData, setAccountToData] = useState(null);
  const [currency, setCurrency] = useState('$');
  const [amount, setAmount] = useState('');
  const [acronym, setAcronym] = useState('');
  const [description, setDescription] = useState('');
  const [transferMoney, { isLoading }] = useTransferMoneyMutation();
  const [accountFrom, setAccountFrom] = useState(null);
  const [accountTo, setAccountTo] = useState(null);
  const [operationDate, setOperationDate] = useState(null);
  const [destination, setDestination] = useState(null);
  const [amountFromData, setAmountFromData] = useState(null);
  const [amountToData, setAmountToData] = useState(null);
  const [tax, setTax] = useState(null);
  const [showModal, setShow] = useState(false);

  const handleDataFrom = (data) => {

    setAccountFromId(data._id);
    setCurrency(data.currency.symbol);
    setAcronym(data.currency.acronym);

    const acountFromData = data.type + data.currency.symbol + data.accountId.substring(3, 7) + ' - ' + data.accountId.substring(11, 21)
    setAccountFrom(acountFromData);
  };

  const handleDataTo = (data) => {

    const acountToData = data.type + data.currency.symbol + data.accountId.substring(3, 7) + ' - ' + data.accountId.substring(11, 21)
    setAccountTo(acountToData);
  };

  const handleCloseModal = () => {
    setShow(false);
  };

  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await transferMoney({ accountFromId: accountFromId, accountTo: accountToData, amount, description }).unwrap();
      toast.success(res.message);
      setOperationDate(res.date);
      setDestination(accountToData);
      setAmountFromData(res.amountFrom);
      setAmountToData(res.amountTo);
      setTax(res.tax);
      setShow(true);
      setAccountF('');
      setAccountFromData(null);
      setAccountFromId(null);
      setAccountT('');
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
                <h3 className='pb-0 mb-0'>Deposito</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form onSubmit={submitDeposit}>
              <Form.Group className='my-2' controlId='accountFrom'>
                <Form.Label className='fw-bold mb-0'>Cuenta a debitar:</Form.Label>
                <Form.Control type='text' className='form-control-edit-input rounded-0' placeholder='Ingrese alias o CBU a debitar' autoComplete='off' minLength={6}
                  maxLength={22} value={accountF} onChange={(e) => setAccountF(e.target.value.toUpperCase())} onBlur={(e) => setAccountFromData(e.target.value)}></Form.Control>

                {accountFromData && (
                  <GetAccount dataAccount={accountF} onData={handleDataFrom} onError={() => { setAccountFromData(null); setAccountFromId(null); }} />
                )}
              </Form.Group>

              <Form.Group className='my-2' controlId='accountTo'>
                <Form.Label className='fw-bold mb-0'>Cuenta a acreditar:</Form.Label>
                <Form.Control type='text' className='form-control-edit-input rounded-0' placeholder='Ingrese alias o CBU a depositar' autoComplete='off' minLength={6}
                  maxLength={22} value={accountT} onChange={(e) => setAccountT(e.target.value.toUpperCase())} onBlur={(e) => setAccountToData(e.target.value)}></Form.Control>

                {accountToData && (
                  <GetAccount dataAccount={accountT} onData={handleDataTo} onError={() => { setAccountToData(null); }} />
                )}
              </Form.Group>

              <Form.Group className='my-2' controlId='amount'>
                <Form.Label className='fw-bold mb-0'>Importe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{currency}</InputGroup.Text>
                  <Form.Control type='text' inputMode='decimal' placeholder='Ingrese importe' autoComplete='off' value={amount} onChange={(e) => setAmount(amountFormat(e.target.value))}
                    disabled={!accountFromData || !accountToData} />
                </InputGroup>
              </Form.Group>

              <Form.Group className='my-2' controlId='description'>
                <Form.Label className='fw-bold mb-0'>Motivo</Form.Label>
                <Form.Control type='text' className='form-control-edit-input rounded-0' placeholder='Ingrese motivo' autoComplete='off' minLength={1} maxLength={50}
                  value={description} onChange={(e) => setDescription(e.target.value.toUpperCase())} disabled={!accountFromData || !accountToData || !amount}></Form.Control>
              </Form.Group>

              <hr />

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='mb-3 ml-auto' disabled={!accountFromData || !accountToData || !amount || !description}>
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

export default CustomerTransferMoney;