import React from 'react';
import CardContainer from '../components/CardContainer';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import { useShowAllOperationsQuery } from '../slices/operationApiSlice';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import { Button, Nav } from 'react-bootstrap';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import ContentBox from '../components/ContentBox';
import { FaChevronCircleRight } from "react-icons/fa";
import ImageContainer from '../components/ImageContainer';

const AccountOperations = ({ _id, currency }) => {
  const { data: dataOperation, error: errorOperation, isLoading: isLoadingOperation } = useShowAllOperationsQuery({ id: _id });

  if (isLoadingOperation) {
    return (
      <div className='box button-container py-0 d-flex justify-content-between'>
        <Loader />
      </div>
    );
  }

  if (errorOperation) {
    toast.error(errorOperation.data?.message || errorOperation.error);
    return (
      <div className='box button-container py-0 d-flex justify-content-between'>
        <h3>Operación: {_id}</h3>
        <p>Error al cargar las operaciones</p>
      </div>
    );
  }

  const { idOperation, operationDate, type, amountFrom } = dataOperation;
  const isNegative = amountFrom < 0;

  return (
    <div className='box button-container py-0 d-flex justify-content-between'>
      <p className='d-inline mb-0 box-text'>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(operationDate)).replace(/,/g, " -")}</p>
      <p className='d-inline mb-0 box-text text-start'>{type.toUpperCase()}</p>
      <p className={isNegative ? "negative-number d-inline mb-0 box-text box text-end" : "d-inline mb-0 box-text box text-end"}>{amountFrom.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
    </div>
  );
};

const Home = () => {
  const { data: dataAccount, error: errorAccount, isLoading: isLoadingAccount } = useShowAccountsQuery();

  const isLoading = isLoadingAccount;
  const error = errorAccount;

  if (isLoading) return <Loader />;
  if (error) {
    toast.error(error.data?.message || error.error);
    return <div>Error al cargar las cuentas</div>;
  }

  const { accounts } = dataAccount;

  return (
    <div className='box'>
      <ImageContainer />
      <div className="d-flex justify-content-around">
        <CardContainer>
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Cuentas</h2>
          </div>
          <ContentBox>
            {accounts.length > 0 ? (
              <>
                <div className='box d-flex flex-column'>
                  {accounts.map((account) => (
                    <>
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
                            </div>
                          </div>
                        </div>
                        <div className='box d-flex align-items-center'>
                          <FaChevronCircleRight />
                        </div>
                      </div>
                      <hr />
                    </>
                  ))}
                </div>
                <div className="box mt-0 d-flex justify-content-center">
                  <Button as={Link} to="/ruta" variant="primary" className="btn col col-md-8 btn">
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

        <CardContainer>
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Últimas operaciones</h2>
          </div>
          <ContentBox>
            {accounts.map((account) => (
              <>
                <div className='box'>
                  <p className='d-inline fw-bold mb-0 box-text'>
                    {account.type}
                    <span> $ </span>
                    {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                  </p>
                  {account.operations.length > 0 ? (
                    <>
                      <div className='box d-flex flex-column'>
                        {account.operations.slice().reverse().slice(0, 2).map((operation) => (
                          <AccountOperations key={operation._id} _id={operation._id} currency={account.currency.acronym} />
                        ))}
                      </div>
                      <div className="mt-0 mb-0 div-center">
                        <LinkContainer to={`/accountOperations/${account._id}`}>
                          <Nav.Link className="custom-link">Ver todos las operaciones</Nav.Link>
                        </LinkContainer>
                      </div>
                    </>
                  ) : (
                    <div className='box button-container py-0 d-flex justify-content-between'>
                      <h6 className="h-striped">No existen operaciones en esta cuenta</h6>
                    </div>
                  )}
                </div>
                <hr />
              </>
            ))}
          </ContentBox>
        </CardContainer>
        <br />
      </div>
    </div>
  );
};

export default Home;