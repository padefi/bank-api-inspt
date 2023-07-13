import React, { useEffect, useState } from 'react';
import { useActiveAccountMutation, useCloseAccountMutation, useGetCustomerAccountsQuery } from '../../slices/accountApiSlice';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaRegCheckCircle, FaShareSquare, FaTimes } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import { Button, Table } from 'react-bootstrap';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useNavigate, useParams } from 'react-router-dom';

const CustomerAccounts = () => {
  useCheckCookies();
  useSessionTimeout();
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useGetCustomerAccountsQuery({ id: id }, { refetchOnMountOrArgChange: true });
  const [closeAccount, { isLoading: isLoadingCloseAccount }] = useCloseAccountMutation();
  const [activeAccount, { isLoading: isLoadingActiveAccount }] = useActiveAccountMutation();

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

  const handleCloseAccount = async (e, accountId) => {
    e.preventDefault();
    try {
      const res = await closeAccount({ accountId }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleActiveAccount = async (e, accountId) => {
    e.preventDefault();
    try {
      const res = await activeAccount({ accountId }).unwrap();
      toast.success(res.message);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleClickOperation = (accountId) => {
    navigate(`/bank/accountOperations/${accountId}`);
  };

  const accounts = data?.accounts || [];

  return (
    <div className='box'>
      <div className="d-flex justify-content-around mt-5">
        <CardContainer id="BankCardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Cuentas</h2>
          </div>
          {isLoading || isFetching && <Loader />}
          <div className='box-details'>
            <Table striped bordered hover className='mb-0 detail-table'>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>N° de cuenta</th>
                  <th>Datos</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {accounts.length > 0 ? (
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account._id}>
                      <td>{account.type} {account.currency.symbol}</td>
                      <td>{account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}</td>
                      <td>
                        <div className='box'>
                          <div><strong>CBU: </strong>{account.accountId}</div>
                          <div><strong>ALIAS: </strong>{account.alias}</div>
                        </div>
                      </td>
                      <td>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
                      <td>{account.isActive ? (`Activa`) : (`Baja`)}</td>
                      <td>
                        <div className='box d-flex justify-content-center'>
                          <Button variant="outline-primary" title="Ver operaciones" size="sm" className='mr-2' onClick={() => handleClickOperation(account._id)}><FaShareSquare /></Button>
                          {account.isActive ? (
                            <>
                              <Button variant="outline-danger" title="Cerrar cuenta" size="sm" onClick={(e) => handleCloseAccount(e, account._id)}><FaTimes /></Button>
                              {isLoadingCloseAccount && <Loader />}
                            </>
                          ) : (
                            <>
                              <Button to="/client/" variant="outline-success" title="Activar cuenta" className="btn btn-custom d-flex align-items-center" onClick={(e) => handleActiveAccount(e, account._id)}><FaRegCheckCircle /></Button>
                              {isLoadingActiveAccount && <Loader />}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={6}><h5 className="h-striped">No se encontraron cuentas</h5></td>
                  </tr>
                </tbody>
              )}
            </Table>
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default CustomerAccounts;