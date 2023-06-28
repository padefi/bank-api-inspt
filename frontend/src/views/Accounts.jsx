import React, { useEffect, useState } from 'react';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import CardContainer from '../components/CardContainer';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import ContentBox from '../components/ContentBox';
import { FaChevronCircleRight } from "react-icons/fa";
import useCheckCookies from '../utils/useCheckCookies';

const Accounts = () => {
  useCheckCookies();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error, isLoading, isFetching } = useShowAccountsQuery({ id: '' }, { refetchOnMountOrArgChange: true });

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
    <div className='box'>
      <CardContainer>
        <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
          <h2 className='card-title'>Cuentas</h2>
        </div>
        {isLoading || isFetching && <Loader />}
        <ContentBox>
          {accounts.length > 0 ? (
            <div className='box d-flex flex-column'>
              {accounts.map((account) => (
                <React.Fragment key={account._id}>
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
                </React.Fragment>
              ))}
              {/* <div className="box mt-0 d-flex justify-content-center">
                <Button as={Link} to="/ruta" variant="primary" className="btn col col-md-8 btn">
                  <p className='my-0 py-0 btn-title'>Ver cuentas</p>
                </Button>
              </div> */}
            </div>
          ) : (
            <div className='box button-container py-0 d-flex justify-content-between'>
              <h5 className="h-striped">No se encontraron cuentas bancarias</h5>
            </div>
          )}
        </ContentBox>
      </CardContainer>
      <br />
    </div>
  );
};

export default Accounts;