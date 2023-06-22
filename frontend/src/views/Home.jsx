import React from 'react';
import Table from 'react-bootstrap/Table';
import FormContainer from '../components/FormContainer';
import { useShowAccountsQuery } from '../slices/accountApiSlice';
import { useShowAllOperationsQuery } from '../slices/operationApiSlice';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav } from 'react-bootstrap';

const AccountOperations = ({ _id, currency }) => {
  const { data: dataOperation, error: errorOperation, isLoading: isLoadingOperation } = useShowAllOperationsQuery({ id: _id });

  if (isLoadingOperation) {
    return (
      <tr>
        <td colSpan={3}>
          <div>
            <h3>Operación: {_id}</h3>
            <div>Cargando operaciones...</div>
          </div>
        </td>
      </tr>
    );
  }

  if (errorOperation) {
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
        <h3>Cuentas</h3>
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
          <div className="div-striped">
            <h5 className="h-striped">No se encontraron cuentas bancarias</h5>
          </div>
        )}
      </FormContainer>

      <FormContainer>
        <h3>Últimas operaciones</h3>
        {accounts.map((account) => (
          <div key={account.accountId}>
            <h5>Cuenta: {account.accountId}</h5>
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
                  {account.operations.slice(0, 2).map((operation) => (
                    <AccountOperations key={operation._id} _id={operation._id} currency={account.currency.acronym} />
                  ))}
                  <tr>
                    <td colSpan={3} align='center'>
                      <LinkContainer to='/accountOperations'>
                        <Nav.Link className="custom-link">Ver todos los movimientos...</Nav.Link>
                      </LinkContainer>
                    </td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <div className="div-striped">
                <h6 className="h-striped">No existen operaciones en esta cuenta</h6>
              </div>
            )}
          </div>
        ))}
      </FormContainer>
      <br />
    </div>
  );
};

export default Home;