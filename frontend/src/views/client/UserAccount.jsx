import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActiveAccountMutation, useChangeAliasMutation, useCloseAccountMutation, useGetUserAccountQuery } from '../../slices/accountApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import useCheckCookies from '../../utils/useCheckCookies';
import BoxContainer from '../../components/BoxContainer';
import CardContainer from '../../components/CardContainer';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { Form, Button } from 'react-bootstrap';
import { FaCheck, FaPencilAlt, FaTimes } from "react-icons/fa";
import { useSelector } from 'react-redux';

const UserAccount = () => {
  useCheckCookies();
  useSessionTimeout();
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useGetUserAccountQuery({ id }, { refetchOnMountOrArgChange: true });
  const [alias, setAlias] = useState('');
  const [isAliasEditable, setIsAliasEditable] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [closeAccount, { isLoading: isLoadingCloseAccount }] = useCloseAccountMutation();
  const [activeAccount, { isLoading: isLoadingActiveAccount }] = useActiveAccountMutation();
  const [changeAlias, { isLoading: isLoadingChangeAlias }] = useChangeAliasMutation();

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      if (data?.account) setAlias(data.account.alias);
      setCheckAccountsCompleted(true);
    }
  }, [data, error]);

  if (!checkAccountsCompleted) {
    return null;
  }

  const handleCloseAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await closeAccount({ accountId: id }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleActiveAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await activeAccount({ accountId: id }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleEditClick = () => {
    setIsAliasEditable(true)
    setShowSubmitButton(true);
  };

  const handleCancelClick = () => {
    setIsAliasEditable(false);
    setShowSubmitButton(false);
    setAlias(data.account.alias);
  };

  const submitChangeAlias = async (e) => {
    e.preventDefault();
    if (alias !== data.account.alias) {
      try {
        const res = await changeAlias({ accountId: id, alias }).unwrap();
        toast.success(res.message);
        setIsAliasEditable(false);
        setShowSubmitButton(false);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    } else {
      toast.error('No ha realizado ninguna modificación del alias.');
    }
  };

  const account = data?.account || null;

  return (
    <BoxContainer>
      <CardContainer className="p-4" id="box-details">
        <div className='box'>
          <div className='box mb-2'>
            <div className='box d-flex flex-row bg-dark text-white p-3 px-4 rounded-top-2'>
              <h3 className='pb-0 mb-0'>Detalle de Cuenta</h3>
            </div>
          </div>
        </div>
        <div className='box px-4 pb-4 box-details'>
          {isLoading || isFetching && <Loader />}
          {account ? (
            <div className='box d-flex flex-column'>
              <div className='box button-container center pt-1 d-flex justify-content-between'>
                <div className='box'>
                  <p className='d-inline fw-bold mb-0 box-text text-cuenta'>
                    {account.type}
                    <span> {account.currency.symbol} </span>
                    {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                  </p>
                </div>
                <div className='box d-flex flex-column'>
                  <div className='box d-flex my-2 justify-content-end'>
                    {account.isActive ? (
                      <>
                        <Button to="/" variant="outline-danger" className="btn btn-custom d-flex align-items-center" onClick={handleCloseAccount}>
                          <p className='mb-0 txt-btn-default'>Cerrar Cuenta</p>
                        </Button>
                        {isLoadingCloseAccount && <Loader />}
                      </>
                    ) : (
                      <>
                        <Button to="/" variant="outline-success" className="btn btn-custom d-flex align-items-center" onClick={handleActiveAccount}>
                          <p className='mb-0 txt-btn-default'>Habilitar Cuenta</p>
                        </Button>
                        {isLoadingActiveAccount && <Loader />}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <hr />
              <div className='box d-flex justify-content-between'>
                <div className='box w-100'>
                  <div className='box d-flex align-items-center'>
                    <p className='my-1 form-label'><b>CBU: </b></p>
                    <p className='my-1'>{account.accountId}</p>
                  </div>
                  <Form onSubmit={submitChangeAlias}>
                    <Form.Group className='box my-2 d-flex align-items-center' controlId='alias'>
                      <div className='box d-flex align-items-baseline'>
                        <Form.Label className='fw-bold mb-0'>Alias CBU: </Form.Label>
                        <div className='flex-fill'>
                          <div className='box form-control-edit d-flex align-items-center'>
                            <div className='form-control-edit bold-text'>
                              <Form.Control type='alias' className='form-control-edit-input rounded-0' placeholder='Ingrese el alias' minLength={6} maxLength={20} value={alias} onChange={(e) => setAlias(e.target.value.toUpperCase())} disabled={!isAliasEditable}></Form.Control>
                            </div>
                            {!showSubmitButton && (
                              <Button className="btn px-0 py-0 btn-edit" variant="" onClick={handleEditClick}>
                                <FaPencilAlt />
                              </Button>
                            )}
                            {showSubmitButton && (
                              <>
                                <Button className="btn px-0 py-0 btn-edit" variant="" type="submit">
                                  <FaCheck className="green-icon" />
                                </Button>
                                <Button className="btn px-0 py-0 btn-edit" variant="" onClick={handleCancelClick}>
                                  <FaTimes className="red-icon" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Form.Group>
                    {isLoadingChangeAlias && <Loader />}

                  </Form>
                  <div className='box my-3'>
                    <div className='box d-flex'>
                      <p className='mb-0 fw-bold'>Saldo: </p>
                      <div className='box mb-0 mx-1 text-nowrap txt-input-help'>
                        <p className='mb-0'>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

export default UserAccount;