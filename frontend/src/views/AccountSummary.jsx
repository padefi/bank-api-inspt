import React, { useState } from 'react';
import CardContainer from '../components/CardContainer';
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import useSessionTimeout from '../utils/useSessionTimeout';
import { Button, Col, Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import UserAccounts from '../utils/userAccounts';

const AccountSumarry = () => {
  useCheckCookies();
  useSessionTimeout();
  const { data, error, refetch } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });
  const options = UserAccounts({ data, error });
  const [accountId, setAccountId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const selectStyles = () => ({
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });

  const defaultSelectValue = () => ({
    value: '',
    label: "Seleccione una cuenta",
  });

  const submitAccountSummary = () => {

  }

  return (
    <BoxContainer>
      <div className="d-flex justify-content-around">
        <CardContainer className="p-4" id="box-operation">
          <div className='box'>
            <div className='box mb-2'>
              <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
                <h3 className='pb-0 mb-0'>Resumen de cuenta</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form onSubmit={submitAccountSummary}>
              <Form.Group className='my-2'>
                <div className='fw-bold'>Cuenta</div>
                <Select options={options} onChange={(option) => setAccountId(option?.value || null)} styles={selectStyles}
                  menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
              </Form.Group>

              <Form.Group className='my-2' controlId='date'>
                <Col className='mb-2'>
                  <Form.Label className='fw-bold mb-0'>Fecha desde:</Form.Label>
                  <Form.Control type='date' className="form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </Col>

                <Col>
                  <Form.Label className='fw-bold mb-0'>Fecha hasta:</Form.Label>
                  <Form.Control type='date' className="form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </Col>
              </Form.Group>

              <hr />

              <div className='d-flex justify-content-end'>
                <Button type='submit' variant='success' className='mb-3 ml-auto' disabled={!accountId || !dateFrom || !dateTo}>
                  Emitir resumen
                </Button>
              </div>
            </Form>
          </div>
        </CardContainer>
      </div>
      <br />
    </BoxContainer >
  );
};

export default AccountSumarry;