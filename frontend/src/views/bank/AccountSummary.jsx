import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { Button, Col, Form } from 'react-bootstrap';
import { useGetAccountQuery } from '../../slices/accountApiSlice';
import AccountSummaryPDF from '../../components/AccountSummaryPDF';
import { pdf } from '@react-pdf/renderer';
import { useShowAccountOperationsQuery } from '../../slices/operationApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const GetAccount = ({ dataAccount, onDataId, onError }) => {
  const [checkAccountCompleted, setCheckAccountCompleted] = useState(false);
  const [isError, setIsError] = useState(false);
  const { data, error, isLoading, isFetching } = useGetAccountQuery({ data: dataAccount }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      setIsError(true);
      onError();
      toast.error(error.data?.message || error.error);
    } else if (data) {
      onDataId(data.accounts._id);
      setIsError(false);
      setCheckAccountCompleted(true);
    }
  }, [data, error]);

  if (isError) {
    return null;
  }

  if (!checkAccountCompleted) {
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

const CustomerAccountSumarry = () => {
  useCheckCookies();
  useSessionTimeout();
  const [account, setAccount] = useState('');
  const [accountData, setAccountData] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [dateFromData, setDateFromData] = useState(null);
  const [dateToData, setDateToData] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dataAccountOperations, setDataAccountOperations] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  const handleDataId = (data) => {
    setAccountId(data);
  };

  const handleDataLoaded = (data) => {
    setDataAccountOperations(data);
  };

  const handleDownloadPDF = async () => {
    const blob = await pdf(<AccountSummaryPDF
      holder={userInfo.firstName + ' ' + userInfo.lastName}
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
                <h3 className='pb-0 mb-0'>Resumen de cuenta</h3>
              </div>
            </div>
          </div>
          <div className='box px-4 d-flex flex-column box-details '>
            <Form.Group className='my-2' controlId='account'>
              <div className='fw-bold'>Cuenta</div>
              <Form.Control type='text' className='form-control-edit-input rounded-0' placeholder='Ingrese alias o CBU a transferir' autoComplete='off' minLength={6}
                maxLength={22} value={account} onChange={(e) => setAccount(e.target.value.toUpperCase())} onBlur={(e) => setAccountData(e.target.value)}></Form.Control>

              {accountData && (
                <GetAccount dataAccount={account} onDataId={handleDataId} onError={() => { setAccountData(null); setAccountId(null); }} />
              )}
            </Form.Group>

            <Form.Group className='my-2' controlId='date'>
              <Col className='mb-2'>
                <Form.Label className='fw-bold mb-0'>Fecha desde:</Form.Label>
                <Form.Control type='date' className="form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} onBlur={(e) => setDateFromData(e.target.value)} />
              </Col>

              <Col>
                <Form.Label className='fw-bold mb-0'>Fecha hasta:</Form.Label>
                <Form.Control type='date' className="form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} onBlur={(e) => setDateToData(e.target.value)} />
              </Col>
            </Form.Group>

            <hr />

            {accountId && dateFromData && dateToData &&
              <AccountOperations accountId={accountId} dateFrom={dateFrom} dateTo={dateTo} onDataLoaded={handleDataLoaded} />
            }

            <div className='d-flex justify-content-end'>
              <Button type='submit' variant='success' className='mb-3 ml-auto' onClick={handleDownloadPDF} disabled={!accountData || !dateFrom || !dateTo || !dataAccountOperations}>
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

export default CustomerAccountSumarry;