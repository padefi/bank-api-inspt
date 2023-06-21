import React from 'react';
import Table from 'react-bootstrap/Table';
import FormContainer from '../components/FormContainer';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import { useShowOperationsQuery } from '../slices/operationApiSlice';

const AccountOperations = ({ accountId, _id, currency }) => {
  const { data: dataOperation, error: errorOperation, isLoading: isLoadingOperation } = useShowOperationsQuery({ accountId: _id });

  if (isLoadingOperation) {
    return (
      <div>
        <h3>Cuenta: {accountId}</h3>
        <div>Cargando operaciones...</div>
      </div>
    );
  }

  if (errorOperation) {
    return (
      <div>
        <h3>Cuenta: {accountId}</h3>
        <div>Error al cargar las operaciones</div>
      </div>
    );
  }

  const { operations } = dataOperation;

  return (
    <div>
      <h3>Cuenta: {accountId}</h3>

      {operations.length > 0 ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={operation.operationId}>
                <td>{operation.operationDate}</td>
                <td>{operation.type}</td>
                <td>{operation.amountFrom.toLocaleString("es-AR", { style: "currency", currency: currency })}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <h5>No existen operaciones para esta cuenta</h5>
      )}
    </div>
  );
};

const Home = () => {
  const { data: dataAccount, error: errorAccount, isLoading: isLoadingAccount } = useShowAccountsQuery();

  const isLoading = isLoadingAccount;
  const error = errorAccount;

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos</div>;

  const { accounts } = dataAccount;
  console.log(accounts);

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
                <tr key={account.accountId}>
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
        <h2>Operaciones</h2>

        {accounts.map((account) => (
          <AccountOperations key={account.accountId} accountId={account._id} _id={account._id} currency={account.currency.acronym} />
        ))}
      </FormContainer>
    </div>
  );
};

export default Home;