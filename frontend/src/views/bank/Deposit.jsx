import React, { useState } from 'react';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useShowAccountsQuery } from '../../slices/accountApiSlice';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { useDepositMoneyMutation } from '../../slices/operationApiSlice';
import UserAccounts from '../../utils/userAccounts';
import ConfirmOperationModal from '../../components/ConfirmOperationModal';

const DepositMoney = () => {
  useCheckCookies();
  useSessionTimeout();
  const [accountId, setAccountId] = useState(null);
  const [currency, setCurrency] = useState('$');
  const [acronym, setAcronym] = useState(null);
  const [accountBalance, setAccountBalance] = useState('$ 0,00');
  const [amount, setAmount] = useState('');
  const [DepositMoney, { isLoading }] = useDepositMoneyMutation();
  const { data, error, refetch } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });
  const options = UserAccounts({ data, error });
  const [accountFrom, setAccountFrom] = useState(null);
  const [operationDate, setOperationDate] = useState(null);
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

  const defaultSelectValue = () => ({
    value: 0,
    label: "Seleccione una cuenta",
    currency: '$',
  });

  const amountChange = (e) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;

    if (decimalCount > 1) {
      const [integerPart, decimalPart] = sanitizedValue.split('.');
      const formattedValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
      setAmount(formattedValue);
    } else if (decimalCount === 1 && sanitizedValue.split('.')[1].length > 2) {
      const [integerPart, decimalPart] = sanitizedValue.split('.');
      const formattedValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
      setAmount(formattedValue);
    } else {
      setAmount(sanitizedValue);
    }
  };

  const handleCloseModal = () => {
    setShow(false);
  };

  const [selectedOptionKey, setSelectedOptionKey] = useState(0);

  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await DepositMoney({ accountId, amount }).unwrap();
      toast.success(res.message);
      setOperationDate(res.date);
      setAmountFromData(res.amountFrom);
      setAmountToData(res.amountTo);
      setTax(res.tax);
      setShow(true);
      setSelectedOptionKey((prevKey) => prevKey + 1);
      setAccountId(null);
      setAccountBalance('$ 0,00');
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
                <h3 className='pb-0 mb-0'>Deposito</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form onSubmit={submitDeposit}>
              <Form.Group className='my-2'>
                <div className='fw-bold'>Cuenta a acreditar</div>
                <Select key={selectedOptionKey} options={options} onChange={(option) => { setAccountId(option?.value || null); setAccountFrom(option?.label || null); setCurrency(option?.currency || '$'); setAcronym(option?.acronym || null); setAccountBalance(option?.balance || '$ 0,00'); }} styles={selectStyles}
                  menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
                <Form.Text className="text-muted">
                  Saldo: {accountBalance}
                </Form.Text>
              </Form.Group>

              <Form.Group className='my-2' controlId='amount'>
                <Form.Label className='fw-bold mb-0'>Importe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{currency}</InputGroup.Text>
                  <Form.Control type='text' inputMode='decimal' placeholder='Ingrese importe' value={amount} onChange={amountChange} disabled={!accountId} />
                </InputGroup>
              </Form.Group>

              <hr />

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='mb-3 ml-auto' disabled={!accountId || !amount}>
                  Depositar
                </Button>
              </div>
            </Form>
            {isLoading && <Loader />}
            {showModal && <ConfirmOperationModal state={showModal}
              type='Deposito'
              desc='acreditado'
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

export default DepositMoney;