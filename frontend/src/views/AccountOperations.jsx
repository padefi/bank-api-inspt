import React, { useEffect, useState } from 'react';
import { useShowAccountOperationsQuery, useShowAllOperationsQuery } from '../slices/operationApiSlice';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import CardContainer from '../components/CardContainer';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import useSessionTimeout from '../utils/useSessionTimeout';
import Select from 'react-select';

const Operations = ({ data, currency }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleDescriptionClick = () => {
    if (showDescription) setShowDescription(false);
    else setShowDescription(true);
  };

  const isNegative = data.amount < 0 ? true : false;

  return (
    <div className='box'>
      <div className='box d-flex justify-content-between flex-row row-cols-2'>
        <div className='box col-10'>
          <p className='mb-0 txt-default'>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(data.operationDate)).replace(/,/g, " -")}</p>
          <p className='my-1 txt-input-help'>{data.type.toUpperCase()}{data.holderDataFrom.toUpperCase()}</p>
          <div className='box d-flex'>
            <p className='mb-0 txt-input-help'>Saldo: </p>
            <div className='box mb-0 mx-1 text-nowrap txt-input-help'>
              <p className='mb-0'>{data.balance.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
            </div>
          </div>
        </div>
        <div className='box ps-2 d-flex justify-content-end align-items-start col-2'>
          <div className='box text-end'>
            <p className={isNegative ? "negative-number mb-0" : "mb-0"}>{data.amount.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
          </div>
        </div>
      </div>
      <div className='box'>
        <Button variant="primary" size="sm" className="detail-button" onClick={handleDescriptionClick}>
          <span>DETALLE</span>
        </Button>
      </div>
      {showDescription && (
        <div className='box'>
          <p className='mb-0 textbox'>{data.description.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
};

const AccountOperations = () => {
  useCheckCookies();
  useSessionTimeout();
  const { id } = useParams();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [operationType, setOperationType] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useShowAccountOperationsQuery({ accountFrom: id, dateFrom, dateTo, operationType }, { refetchOnMountOrArgChange: true });

  const optionsOperationType = [
    { value: '', label: 'Todas' },
    { value: 'deposito', label: 'Deposito' },
    { value: 'extraccion', label: 'Extraccion' },
    { value: 'transferencia', label: 'Transferencia' }
  ];

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
    }),
  };

  const defaultSelectValue = () => ({
    value: '',
    label: "Todas",
  });

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

  if (!checkAccountsCompleted) {
    return null;
  }

  const account = data || null;

  return (
    <BoxContainer>
      <CardContainer className="p-4" id="box-details">
        <div className='box'>
          <div className='box mb-2'>
            <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
              <h3 className='pb-0 mb-0'>Mis Operaciones</h3>
            </div>
          </div>
        </div>
        <div className='box px-4 pb-4 box-details'>
          {isLoading || isFetching && <Loader />}
          {account ? (
            <div className='box d-flex flex-column'>
              <div className='box button-container pt-1 d-flex justify-content-between'>
                <div className='box'>
                  <p className='d-inline fw-bold mb-0 box-text text-cuenta'>
                    {account.type}
                    <span> {account.currency.symbol} </span>
                    {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                  </p>
                </div>
                <div className='box'>
                  <p className='fw-bold'>Saldo: {account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</p>
                </div>
              </div>
              <div className='box d-flex justify-content-center'>
                <Button variant="primary" size="sm" className="detail-button" onClick={handleAdvancedSearch}>
                  <span>Busqueda avanzada</span>
                </Button>
              </div>
              <div className={`box advanced-search d-flex justify-content-center ${advancedSearch ? 'advanced-search-visible' : 'advanced-search-hidden'}`}>
                <Row className='justify-content-center'>
                  <Col>
                    <div className='box d-flex justify-content-between'>
                      <Form.Group className='mr-2 mb-2'>
                        <Form.Label htmlFor="dateFrom" className='fw-bold detail-text'>Fecha desde:</Form.Label>
                        <Form.Control id="dateFrom" type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); handleAdvanced; }} />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label htmlFor="dateTo" className='fw-bold detail-text'>Fecha hasta:</Form.Label>
                        <Form.Control id="dateTo" type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); handleAdvanced; }} />
                      </Form.Group>
                    </div>
                    <Form.Group>
                      <div className='fw-bold detail-text'>Tipo de operación:</div>
                      <Select options={optionsOperationType} onChange={(optionsOperationType) => { setOperationType(optionsOperationType?.value || null); handleAdvanced; }} styles={selectStyles}
                        menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              {account.operationDataArray.length > 0 ? (
                account.operationDataArray.slice().reverse().map((operation) => (
                  <React.Fragment key={operation.operationId}>
                    <hr />
                    <Operations data={operation} currency={account.currency.acronym} />
                  </React.Fragment>
                ))
              ) : (
                <>
                  <hr />
                  <div className='box button-container py-0 d-flex justify-content-center'>
                    <h5 className="h-striped">No existen en el rango indicado</h5>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <hr />
              <div className='box button-container py-0 d-flex justify-content-between'>
                <h5 className="h-striped">No existen operaciones en esta cuenta</h5>
              </div>
            </>
          )}
        </div>
      </CardContainer>
      <br />
    </BoxContainer >
  );
};

export default AccountOperations;