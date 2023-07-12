import React, { useEffect, useState } from 'react';
import { useGetCustomerAccountsQuery } from '../../slices/accountApiSlice';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaChevronCircleRight, FaPlusCircle, FaRegWindowClose, FaShareSquare, FaTimes } from "react-icons/fa";
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
  const { data, error, isLoading, isFetching } = useGetCustomerAccountsQuery({ id: id }, { refetchOnMountOrArgChange: true });

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

  const handleClickOperation = (accountId) => {
    navigate(`/bank/account/${accountId}`);
  };

  const accounts = data?.accounts || [];

  return (
    <div className='box'>
      <div className="d-flex justify-content-around mt-5">
        <CardContainer id="BankCardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Clientes</h2>
          </div>
          {isLoading || isFetching && <Loader />}
          <div className='box-details'>
            <Table striped bordered hover className='mb-0'>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>N°</th>
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
                        <strong>CBU: </strong>{account.accountId}
                        <strong>ALIAS: </strong>{account.alias}
                      </td>
                      <td>{account.accountBalance}</td>
                      <td>{account.isActive ? (`Activo`) : (`Baja`)}</td>
                      <td>
                        <div className='box d-flex justify-content-center'>
                          <Button variant="outline-primary" title="Ver cuentas" size="sm" className='mr-2' onClick={() => handleClickOperation(account._id)}><FaShareSquare /></Button>
                          <Button variant="outline-danger" title="Editar cliente" size="sm" onClick={() => handleClickClose(account._id)}><FaTimes /></Button>
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