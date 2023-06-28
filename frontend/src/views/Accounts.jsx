import React, { useEffect, useState } from 'react';
import { useGetCurrenciesQuery, useShowAccountsQuery } from '../slices/accountApiSlice';
import CardContainer from '../components/CardContainer';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaChevronCircleRight, FaPlusCircle } from "react-icons/fa";
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import { Button, Form, Modal, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import FormContainer from '../components/FormContainer';

const Currencies = () => {
  const [getCurrenciesCompleted, setGetCurrenciesCompleted] = useState(false);
  const { data, error, isLoading, isFetching } = useGetCurrenciesQuery({}, { refetchOnMountOrArgChange: true });

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

  return (
    <React.Fragment>
      {currencies.map((currency) => (
        <option key={currency._id} value={currency._id}>{currency.symbol}</option>
      ))}
    </React.Fragment>
  );
}

const Accounts = () => {
  useCheckCookies();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const [showModal, setShow] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [currencyType, setCurrencyType] = useState('');
  const { data, error, isLoading, isFetching } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });

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

  const handleButtonOpenModal = () => setShow(true);
  const handleCloseModal = () => setShow(false);


  const submitNewAccount = async (e) => {
    e.preventDefault();
    /* try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/home');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } */
  };

  const accounts = data?.accounts || [];

  return (
    <BoxContainer>
      <CardContainer className="p-4" id="box-details">
        <div className='box'>
          <div className='box mb-2'>
            <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
              <h3 className='pb-0 mb-0 txt-title'>Mis Cuentas</h3>
            </div>
          </div>
        </div>
        <div className='box px-4 d-flex flex-column'>
          <div className='box d-flex my-2 justify-content-end'>
            <Button to="/" variant="outline-primary" className="btn btn-custom d-flex align-items-center" onClick={handleButtonOpenModal}>
              <span className="plus-icon"><FaPlusCircle className='me-2' /></span>
              <p className='mb-0 txt-btn-default'>Nueva Cuenta</p>
            </Button>
          </div>
        </div>
        <div className='box px-4 d-flex flex-column box-details'>
          {isLoading || isFetching && <Loader />}
          {accounts.length > 0 ? (
            <div className='box d-flex flex-column'>
              {accounts.map((account) => (
                <React.Fragment key={account._id}>
                  <hr />
                  <div className='box button-container py-0 d-flex justify-content-between'>
                    <div className='box'>
                      <p className='d-inline fw-bold mb-0 box-text'>
                        {account.type}
                        <span> $ </span>
                        {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                      </p>
                      <div className='box d-flex justify-content-between'>
                        <div className='box'>
                          <div className='box my-1'>
                            <p className='mb-0 box-text'>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</p>
                          </div>
                          <p className='mb-0 box-text'>CBU: {account.accountId}</p>
                          <div className="my-2">
                            <LinkContainer to={`/accountOperations/${account._id}`}>
                              <Nav.Link className="custom-link">Ver todos las operaciones</Nav.Link>
                            </LinkContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='box d-flex align-items-center'>
                      <FaChevronCircleRight />
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className='box button-container py-0 d-flex justify-content-between'>
              <h5 className="h-striped">No se encontraron cuentas bancarias</h5>
            </div>
          )}
        </div>
      </CardContainer>
      <br />

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Nueva Cuenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitNewAccount}>

            <Form.Group className='my-2' controlId='accountType'>
              <Form.Label>Tipo de Cuenta</Form.Label>
              <Form.Select as="select" size="sm" type={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="CA">Caja de Ahorro</option>
                <option value="CC">Cuenta Corriente</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className='my-2' controlId='currencyType'>
              <Form.Label>Tipo de Moneda</Form.Label>
              <Form.Select as="select" size="sm" type={currencyType} onChange={(e) => setCurrencyType(e.target.value)}>
                <Currencies />
              </Form.Select>
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button type='submit' variant='success'>
            Ingresar
          </Button>
        </Modal.Footer>
      </Modal>
    </BoxContainer>
  );
};

export default Accounts;