import React, { useEffect, useState } from 'react';
import { useShowAllOperationsQuery } from '../slices/operationApiSlice';
import { useParams } from 'react-router-dom';
import { useGetAccountQuery } from '../slices/accountApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import useCheckCookies from '../utils/useCheckCookies';
import BoxContainer from '../components/BoxContainer';
import CardContainer from '../components/CardContainer';
import { Button } from 'react-bootstrap';

const Operations = ({ _id, currency, balanceSnapshot }) => {
  const [checkOperationsCompleted, setCheckOperationsCompleted] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const { data, error, isLoading, isFetching } = useShowAllOperationsQuery({ id: _id }, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      setCheckOperationsCompleted(true);
    }
  }, [data, error]);

  if (!checkOperationsCompleted) {
    return null;
  }

  const handleDescriptionClick = () => {
    if (showDescription) setShowDescription(false);
    else setShowDescription(true);
  };

  const operation = data || null;
  const isNegative = operation ? operation.amountFrom < 0 : false;
  return (
    <>
      {isLoading || isFetching && <Loader />}
      {operation ? (
        <div className='box'>
          <div className='box d-flex justify-content-between flex-row row-cols-2'>
            <div className='box col-10'>
              <p className='mb-0 txt-default'>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(operation.operationDate)).replace(/,/g, " -")}</p>
              <p className='my-1 txt-input-help'>{operation.type.toUpperCase()}{operation.holderDataFrom.toUpperCase()}</p>
              <div className='box d-flex'>
                <p className='mb-0 txt-input-help'>Saldo: </p>
                <div className='box mb-0 mx-1 text-nowrap txt-input-help'>
                  <p className='mb-0'>{balanceSnapshot.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
                </div>
              </div>
            </div>
            <div className='box ps-2 d-flex justify-content-end align-items-start col-2'>
              <div className='box text-end'>
                <p className={isNegative ? "negative-number mb-0" : "mb-0"}>{operation.amountFrom.toLocaleString("es-AR", { style: "currency", currency: currency })}</p>
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
              <p className='mb-0 textbox'>{operation.description.toUpperCase()}</p>
            </div>
          )}
        </div>
      ) : (
        <div className='box button-container py-0 d-flex justify-content-between'>
          <h5 className="h-striped">No se encontraron movimientos</h5>
        </div>
      )}
    </>
  );
};

const AccountOperations = () => {
  useCheckCookies();
  const { id } = useParams();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error, isLoading, isFetching } = useGetAccountQuery({ id }, { refetchOnMountOrArgChange: true });

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

  const account = data?.account || null;
  return (
    <BoxContainer>
      <CardContainer className="p-4" id="box-details">
        <div className='box'>
          <div className='box mb-2'>
            <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
              <h3 className='pb-0 mb-0 txt-title'>Mis Operaciones</h3>
            </div>
          </div>
        </div>
        <div className='box px-4 pb-4 box-details'>
          {isLoading || isFetching && <Loader />}
          {account ? (
            <div className='box d-flex flex-column'>
              <div className='box button-container pt-1 d-flex justify-content-between'>
                <div className='box'>
                  <p className='d-inline fw-bold mb-0 box-text'>
                    {account.type}
                    <span> $ </span>
                    {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                  </p>
                </div>
              </div>
              {account.operations.length > 0 ? (
                account.operations.map((operation) => (
                  <React.Fragment key={operation._id}>
                    <hr />
                    <Operations key={operation._id} _id={operation._id} currency={account.currency.acronym} balanceSnapshot={operation.balanceSnapshot} />
                  </React.Fragment>
                ))
              ) : (
                <div className='box button-container py-0 d-flex justify-content-between'>
                  <h5 className="h-striped">No existen operaciones en esta cuenta</h5>
                </div>
              )}
            </div>
          ) : (
            <div className='box button-container py-0 d-flex justify-content-between'>
              <h5 className="h-striped">No se encontró la cuenta bancaria</h5>
            </div>
          )}
        </div>
      </CardContainer>
      <br />
    </BoxContainer>
  );
};

export default AccountOperations;