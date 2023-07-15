import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaUserEdit, FaWallet } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useShowCustomersQuery } from '../../slices/customerApiSlice';
import Select from 'react-select';

const AccountStatusOptions = () => {
  const options = [
    { value: '', label: 'TODOS' },
    { value: 'true', label: 'ACTIVO' },
    { value: 'false', label: 'BAJA' }
  ]

  return options;
}

const Dashboard = () => {
  useCheckCookies();
  useSessionTimeout();
  const navigate = useNavigate();
  const [accountHolder, setAccountHolder] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const accountStatusOptions = AccountStatusOptions();
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [checkCustomersCompleted, setCheckCustomersCompleted] = useState(false);
  const { data, error, isLoading, isFetching } = useShowCustomersQuery({ accountHolder, governmentId, accountStatus }, { refetchOnMountOrArgChange: true });
  const [pageNumber, setPageNumber] = useState(1);
  const itemsPerPage = 10;

  const handleAdvancedSearch = () => {
    setAdvancedSearch(!advancedSearch);
  };

  const selectStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    control: (provided) => ({
      ...provided,
      fontSize: '12px',
      width: '110px',
    }),
  };

  const handleAdvanced = () => {
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      setCheckCustomersCompleted(true);
    }
  }, [error]);

  if (!checkCustomersCompleted) {
    return null;
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(data?.customers?.length / itemsPerPage);
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleClickAccounts = (customerId) => {
    navigate(`/bank/customerAccounts/${customerId}`);
  };

  const handleClickCustomer = (customerId) => {
    navigate(`/bank/customerProfile/${customerId}`);
  };

  let customers = data?.customers || [];
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  return (
    <div className='box'>
      <div className="d-flex justify-content-around mt-5">
        <CardContainer id="BankCardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Clientes</h2>
          </div>
          {isLoading || isFetching && <Loader />}
          <div className='box-details'>
            <div className='box button-container mt-1 px-2 pb-2 pt-1 d-flex justify-content-center'>
              <div className='box mr-4'>
                <Button variant="primary" size="sm" className="detail-button" onClick={handleAdvancedSearch}>
                  <span>Busqueda avanzada</span>
                </Button>
              </div>
            </div>
            <div className={`box advanced-search d-flex justify-content-center mb-2 ${advancedSearch ? 'advanced-search-visible' : 'advanced-search-hidden'}`}>
              <Row className='justify-content-center'>
                <Col>
                  <div className='box d-flex align-items-center justify-content-between mb-1'>
                    <Form.Group className='mr-2'>
                      <Form.Label htmlFor="accountHolder" className='fw-bold detail-text mb-0'>Titular:</Form.Label>
                      <Form.Control id="accountHolder" type="text" className="form-control form-control" value={accountHolder} onChange={(e) => { setAccountHolder(e.target.value.toUpperCase()); handleAdvanced; }} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label htmlFor="governmentId" className='fw-bold detail-text mb-0'>Documento:</Form.Label>
                      <Form.Control id="governmentId" type='text' className="form-control form-control" value={governmentId} onChange={(e) => { setGovernmentId(e.target.value); handleAdvanced; }} />
                    </Form.Group>
                    <Form.Group className='ml-2'>
                      <div className='fw-bold detail-text mt-1'>Estado:</div>
                      <Select options={accountStatusOptions} onChange={(accountStatusOptions) => { setAccountStatus(accountStatusOptions?.value || null); handleAdvanced; }} styles={selectStyles}
                        menuPortalTarget={document.body} defaultValue={accountStatusOptions[0]} />
                    </Form.Group>
                  </div>
                </Col>
              </Row>
            </div>
            <Table striped bordered hover className='mb-0'>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {paginatedCustomers.length > 0 ? (
                <tbody>
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.user._id}>
                      <td>{customer.number}</td>
                      <td>{customer.user.lastName.toUpperCase()} {customer.user.firstName.toUpperCase()}</td>
                      <td><strong>{customer.user.governmentId.type.toUpperCase()}</strong> - {customer.user.governmentId.number}</td>
                      <td>{customer.user.isActive ? (`Activo`) : (`Baja`)}</td>
                      <td>
                        <div className='box d-flex justify-content-center'>
                          <Button variant="outline-primary" title="Ver cuentas" size="sm" className='mr-2' onClick={() => handleClickAccounts(customer.user._id)}><FaWallet /></Button>
                          <Button variant="outline-success" title="Editar cliente" size="sm" onClick={() => handleClickCustomer(customer.user._id)}><FaUserEdit /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={5}><h5 className="h-striped">No se encontraron clientes</h5></td>
                  </tr>
                </tbody>
              )}
            </Table>
          </div>
          <div className="box mt-2 text-center mb-1">
            <Button variant="outline-primary" onClick={handlePreviousPage} disabled={pageNumber === 1} size='sm' className='mr-2'><FaArrowLeft /></Button>
            <Button variant="outline-primary" onClick={handleNextPage} disabled={pageNumber === Math.ceil(customers.length / itemsPerPage)} size='sm'><FaArrowRight /></Button>
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default Dashboard;