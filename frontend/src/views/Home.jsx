import React from 'react';
import Table from 'react-bootstrap/Table';
import FormContainer from '../components/FormContainer';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import { useShowAllOperationsQuery } from '../slices/operationApiSlice';

const AccountOperations = ({ _id, currency }) => {
  const { data: dataOperation, error: errorOperation, isLoading: isLoadingOperation } = useShowAllOperationsQuery({ id: _id });

  if (isLoadingOperation) {
    return (
      <div>
        <h3>Operación: {_id}</h3>
        <div>Cargando operaciones...</div>
      </div>
    );
  }

  if (errorOperation) {
    return (
      <div>
        <h3>Operación: {_id}</h3>
        <div>Error al cargar las operaciones</div>
      </div>
    );
  }

  const { operations } = dataOperation;

  return (
    <tr>
      <td>{new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(operations.operationDate)).replace(/,/g, " -")}</td>
      <td>{operations.type}</td>
      <td>{operations.amountFrom.toLocaleString("es-AR", { style: "currency", currency: currency })}</td>
    </tr>
  );
};

const Home = () => {
  const { data: dataAccount, error: errorAccount, isLoading: isLoadingAccount } = useShowAccountsQuery();

  const isLoading = isLoadingAccount;
  const error = errorAccount;

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar las cuentas</div>;

  const { accounts } = dataAccount;

  return (
    <div>
      <FormContainer>
        <h2>Cuentas</h2>
        {accounts.length > 0 ? (
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
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.type}</td>
                  <td>{account.currency.acronym}</td>
                  <td>{account.accountId}</td>
                  <td>{account.alias}</td>
                  <td>{account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <h5>No se encontraron cuentas bancarias</h5>
        )}
      </FormContainer>

      <FormContainer>
        <h2>Últimas operaciones</h2>
          {accounts.map((account) => (
            <div key={account.accountId}>
              <h5>Cuenta: {account.accountId}</h5>
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {account.operations.length > 0 ? (
                    account.operations.slice(0, 2).map((operation) => (
                      <AccountOperations key={operation._id} _id={operation._id} currency={account.currency.acronym} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}><h6>No existen operaciones para esta cuenta</h6></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          ))}
      </FormContainer>
    </div>
  );
};

export default Home;