import React from 'react';
import Table from 'react-bootstrap/Table';
import FormContainer from '../components/FormContainer';
import { useShowAllOperationsQuery, useShowOperationsQuery } from '../slices/operationApiSlice';
import { useParams } from 'react-router-dom';
import { useShowAccountQuery } from '../slices/accountApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import useCheckCookies from '../utils/useCheckCookies';

const Operations = ({ _id, currency }) => {
  const { data: dataOperation, error: errorOperation, isLoading: isLoadingOperation } = useShowAllOperationsQuery({ id: _id }, { refetchOnMountOrArgChange: true });

  if (isLoadingOperation) {
    return (
      <tr>
        <td colSpan={3}>
          <div>
            <Loader />
          </div>
        </td>
      </tr>
    );
  }

  if (errorOperation) {
    toast.error(errorOperation.data?.message || errorOperation.error);
    return (
      <tr>
        <td colSpan={3}>
          <div>
            <h3>Operación: {_id}</h3>
            <div>Error al cargar las operaciones</div>
          </div>
        </td>
      </tr>
    );
  }

  const { idOperation, operationDate, type, amountFrom } = dataOperation;
  const isNegative = amountFrom < 0;

  return (
    <tr>
      <td>{new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(operationDate)).replace(/,/g, " -")}</td>
      <td>{type.toUpperCase()}</td>
      <td className={isNegative ? "negative-number" : ""}>{amountFrom.toLocaleString("es-AR", { style: "currency", currency: currency })}</td>
    </tr>
  );
};

const AccountOperations = () => {
  useCheckCookies();
  const { id } = useParams();
  const { data: dataAccount, error: errorAccount, isLoading: isLoadingAccount } = useShowAccountQuery({ id }, { refetchOnMountOrArgChange: true });

  const isLoading = isLoadingAccount;
  const error = errorAccount;

  if (isLoading) return <Loader />;
  if (error) {
    toast.error(error.data?.message || error.error);
    return <div>Error al cargar la cuenta</div>;
  }

  const { account } = dataAccount;

  return (
    <FormContainer>
      <h3>Cuenta</h3>
      {account ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>Tipo de cta.</th>
              <th>Moneda</th>
              <th>Nro. de cta.</th>
              <th>Alias</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr key={account._id}>
              <td>{account.type}</td>
              <td>{account.currency.acronym}</td>
              <td>{account.accountId}</td>
              <td>{account.alias}</td>
              <td>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <div className="div-striped">
          <h5 className="h-striped">No se encontró la cuenta bancaria</h5>
        </div>
      )}
      <h3>Movimientos</h3>
      {account.operations.length > 0 ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {account.operations.map((operation) => (
              <Operations key={operation._id} _id={operation._id} currency={account.currency.acronym} />
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="div-striped">
          <h6 className="h-striped">No existen operaciones en esta cuenta</h6>
        </div>
      )}
    </FormContainer>
  );
};

export default AccountOperations;