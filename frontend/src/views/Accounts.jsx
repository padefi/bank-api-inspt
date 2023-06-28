import React, { useEffect, useState } from 'react';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import CardContainer from '../components/CardContainer';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaChevronCircleRight, FaPlusCircle } from "react-icons/fa";
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import { Button, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Accounts = () => {
  useCheckCookies();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
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
            <Button to="/" variant="outline-primary" className="btn d-flex align-items-center btn-none btn">
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
    </BoxContainer>
  );
};

export default Accounts;