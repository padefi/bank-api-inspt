import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { Button, Col, Form } from 'react-bootstrap';
import Select from 'react-select';
import { useShowAccountsQuery } from '../../slices/accountApiSlice';
import UserAccounts from '../../utils/userAccounts';
import AccountSummaryPDF from '../../components/AccountSummaryPDF';
import { pdf } from '@react-pdf/renderer';
import { useShowAccountOperationsQuery } from '../../slices/operationApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const AccountOperations = ({ accountId, dateFrom, dateTo, onDataLoaded }) => {
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error } = useShowAccountOperationsQuery({ accountFrom: accountId, dateFrom, dateTo, operationType: '' }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      setCheckAccountsCompleted(true);
    }
  }, [data, error]);

  useEffect(() => {
    if (data) {
      onDataLoaded(data);
    }
  }, [data, onDataLoaded]);

  if (!checkAccountsCompleted) {
    return null;
  }
}

const AccountSumarry = () => {
  useCheckCookies();
  useSessionTimeout();
  const { data, error } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });
  const options = UserAccounts({ data, error });
  const [accountId, setAccountId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateFromMax, setDateFromMax] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateToMin, setDateToMin] = useState('');
  const [dataAccountOperations, setDataAccountOperations] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  const handleDataLoaded = (data) => {
    setDataAccountOperations(data);
  };

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

  const handleDownloadPDF = async () => {
    if (new Date(dateTo) < new Date(dateFrom)) {
      toast.error('La fecha hasta no puede ser menor que la fecha "desde"');
      return;
    }

    const blob = await pdf(<AccountSummaryPDF
      holder={userInfo.userData}
      dateFrom={dateFrom}
      dateTo={dateTo}
      operations={dataAccountOperations}
    />).toBlob();

    const url = URL.createObjectURL(blob);
    /* window.open(url, '_blank'); // Abre el PDF en una nueva pestaña */
    const link = document.createElement('a');
    link.href = url;
    link.download = dataAccountOperations.accountId + '.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <BoxContainer>
      <div className="d-flex justify-content-around">
        <CardContainer className="p-4" id="box-operation">
          <div className='box'>
            <div className='box mb-2'>
              <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
                <h3 className='pb-0 mb-0'> de cuenta</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form.Group className='my-2'>
              <div className='fw-bold'>Cuenta</div>
              <Select options={options} onChange={(option) => setAccountId(option?.value || null)} styles={selectStyles}
                menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
            </Form.Group>

            <Form.Group className='my-2' controlId='date'>
              <Col className='mb-2'>
                <Form.Label className='fw-bold mb-0'>Fecha desde:</Form.Label>
                <Form.Control type='date' className="form-control-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setDateToMin(e.target.value); }} max={dateFromMax} />
              </Col>

              <Col>
                <Form.Label className='fw-bold mb-0'>Fecha hasta:</Form.Label>
                <Form.Control type='date' className="form-control-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setDateFromMax(e.target.value); }} min={dateToMin} />
              </Col>
            </Form.Group>

            <hr />

            {accountId && dateFrom && dateTo &&
              <AccountOperations accountId={accountId} dateFrom={dateFrom} dateTo={dateTo} onDataLoaded={handleDataLoaded} />
            }

            <div className='d-flex justify-content-end'>
              <Button type='submit' variant='success' className='mb-3 ml-auto' onClick={handleDownloadPDF} disabled={!accountId || !dateFrom || !dateTo || !dataAccountOperations}>
                Emitir resumen
              </Button>
            </div>
          </div>
        </CardContainer>
      </div>
      <br />
    </BoxContainer >
  );
};

export default AccountSumarry;