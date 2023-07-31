import React, { useEffect } from 'react';
import CardContainer from '../../components/CardContainer';
import { useShowAccountsQuery } from '../../slices/accountApiSlice';
import { useShowAllOperationsQuery } from '../../slices/operationApiSlice';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Nav } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import ContentBox from '../../components/ContentBox';
import { FaChevronCircleRight } from "react-icons/fa";
import ImageContainer from '../../components/ImageContainer';
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';

const AccountOperations = ({ _id, accountFrom, currency }) => {
  const { data = [], error, isLoading, isFetching } = useShowAllOperationsQuery({ id: _id, accountFrom });

  if (isLoading || isFetching) {
    return (
      <div className='box button-container py-0 d-flex justify-content-between'>
        <Loader />
      </div>
    );
  }

  if (error) {
    toast.error(error.data?.message || error.error);
    return (
      <div className='box button-container py-0 d-flex justify-content-between'>
        <h3>Operación: {_id}</h3>
        <p>Error al cargar las operaciones</p>
      </div>
    );
  }

  const { operationDate, type, amount } = data;
  const isNegative = amount < 0;

  return (
    <div className='box button-container py-0 d-flex justify-content-between'>
      <p className='d-inline mb-0 box-text'>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(operationDate)).replace(/,/g, " -")}</p>
      <p className='d-inline mb-0 box-text text-start'>{type.toUpperCase()}</p>
      <p className={isNegative ? "negative-number d-inline mb-0 box-text box text-end" : "d-inline mb-0 box-text box text-end"}>{amount.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
    </div>
  );
};

const Home = () => {
  useCheckCookies();
  useSessionTimeout();
  const navigate = useNavigate();
  const { data = [], error, isLoading, isFetching } = useShowAccountsQuery({}, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    }
  }, [error]);

  const handleClickAccount = (accountId) => {
    navigate(`/customer/userAccount/${accountId}`);
  };

  let accounts = data?.accounts || [];

  return (
    <div className='box'>
      <ImageContainer />
      <div className="d-flex justify-content-around">
        <CardContainer id="CardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Cuentas</h2>
          </div>
          {isLoading || isFetching && <Loader />}
          <ContentBox>
            {accounts.length > 0 ? (
              <>
                <div className='box d-flex flex-column'>
                  {accounts.map((account) => (
                    <React.Fragment key={account._id}>
                      <div className='box button-container py-0 d-flex justify-content-between'>
                        <div className='button-container-child default focusMouse cursor-pointer' role='button' onClick={() => handleClickAccount(account._id)}></div>
                        <div className='box'>
                          <p className='d-inline fw-bold mb-0 box-text text-cuenta'>
                            {account.type}
                            <span> {account.currency.symbol} </span>
                            {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                          </p>
                          <div className='box d-flex justify-content-between'>
                            <div className='box'>
                              <div className='box my-1'>
                                <p className='mb-0 box-text'>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</p>
                              </div>
                              <p className='mb-0 box-text'><b>CBU: </b>{account.accountId}</p>
                            </div>
                          </div>
                        </div>
                        <div className='box d-flex align-items-center'>
                          <FaChevronCircleRight className='button-icon-description' />
                        </div>
                      </div>
                      <hr />
                    </React.Fragment>
                  ))}
                </div>
                <div className="box mt-0 d-flex justify-content-center">
                  <Button as={Link} to="/customer/accounts" variant="primary" className="btn col col-md-8 btn">
                    <p className='my-0 py-0 btn-title'>Ver cuentas</p>
                  </Button>
                </div>
              </>
            ) : (
              <div className='box button-container py-0 d-flex justify-content-between'>
                <h5 className="h-striped">No se encontraron cuentas bancarias</h5>
              </div>
            )}
          </ContentBox>
        </CardContainer>

        <CardContainer id="CardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Últimas Operaciones</h2>
          </div>
          <ContentBox>
            {accounts.map((account) => (
              <React.Fragment key={account._id}>
                <div className='box'>
                  <p className='d-inline fw-bold mb-0 box-text'>
                    {account.type}
                    <span> {account.currency.symbol} </span>
                    {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                  </p>
                  {account.operations.length > 0 ? (
                    <>
                      <div className='box d-flex flex-column'>
                        {account.operations.slice().reverse().slice(0, 2).map((operation) => (
                          <AccountOperations key={operation._id} _id={operation._id} accountFrom={account._id} currency={account.currency.acronym} />
                        ))}
                      </div>
                      <div className="mt-0 mb-0 div-center">
                        <LinkContainer to={`/customer/accountOperations/${account._id}`}>
                          <Nav.Link className="custom-link">Ver todos las operaciones</Nav.Link>
                        </LinkContainer>
                      </div>
                    </>
                  ) : (
                    <div className='box button-container pb-3 px-3 d-flex justify-content-between'>
                      <h5 className="h-striped">No existen operaciones en esta cuenta</h5>
                    </div>
                  )}
                </div>
                <hr />
              </React.Fragment>
            ))}
          </ContentBox>
        </CardContainer>
        <br />
      </div>
    </div>
  );
};

export default Home;