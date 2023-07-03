import React, { useEffect, useState } from 'react';
import CardContainer from '../components/CardContainer';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import useSessionTimeout from '../utils/useSessionTimeout';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { useDepositMoneyMutation } from '../slices/operationApiSlice';

const UserAccounts = () => {
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });

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
  }));

  return options;
}

const DepositMoney = () => {
  useCheckCookies();
  useSessionTimeout();
  const [accountId, setAccountId] = useState(null);
  const [currency, setCurrency] = useState('$');
  const [amount, setAmount] = useState('');
  const options = UserAccounts();
  const [DepositMoney, { isLoading }] = useDepositMoneyMutation();

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

  const [selectedOptionKey, setSelectedOptionKey] = useState(0);

  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await DepositMoney({ accountId, amount }).unwrap();
      toast.success(res.message);
      setSelectedOptionKey((prevKey) => prevKey + 1);
      setAccountId(null);
      setAmount('');
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
              <h6>Cuenta</h6>
              <Select key={selectedOptionKey} options={options} onChange={(option) => {setAccountId(option?.value || null); setCurrency(option?.currency || '$')}} styles={selectStyles}
                menuPortalTarget={document.body} defaultValue={defaultSelectValue} />

              <Form.Group className='my-2' controlId='amount'>
                <Form.Label>Importe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>{currency}</InputGroup.Text>
                  <Form.Control type='text' inputMode='decimal' placeholder='Ingrese importe' value={amount} onChange={amountChange} disabled={!accountId} />
                </InputGroup>
              </Form.Group>

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='my-3 ml-auto' disabled={!accountId || !amount}>
                  Depositar
                </Button>
              </div>
            </Form>
            {isLoading && <Loader />}
          </div>
        </CardContainer>
      </div>
      <br />
    </BoxContainer >
  );
};

export default DepositMoney;