import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaPlusCircle, FaUserEdit, FaWallet } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useCreateCustomerMutation, useShowCustomersQuery } from '../../slices/customerApiSlice';
import Select from 'react-select';
import numberFormat from '../../utils/numberFormat';

const AccountStatusOptions = () => {
  const options = [
    { value: '', label: 'TODOS' },
    { value: 'true', label: 'ACTIVO' },
    { value: 'false', label: 'BAJA' }
  ]

  return options;
}

const CustomerTypes = () => {
  const options = [
    { value: 'PC', label: 'PERSONA FISICA' },
    { value: 'BC', label: 'PERSONA JURIDICA' }
  ]

  return options;
}

const GovernmentIdTypes = () => {
  const options = [
    { value: 'cuil', label: 'CUIL' },
    { value: 'cuit', label: 'CUIT' },
    { value: 'dni', label: 'DNI' },
    { value: 'pas', label: 'PASAPORTE' },
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
  const [showModal, setShow] = useState(false);
  const [governmentIdTypeModal, setGovernmentIdTypeModal] = useState('');
  const [governmentIdModal, setGovernmentIdModal] = useState('');
  const [customerTypeModal, setCustomerTypeModal] = useState('');
  const [firstNameModal, setFirstNameModal] = useState('');
  const [lastNameModal, setLastNameModal] = useState('');
  const [bornDateModal, setBornDateModal] = useState('');
  const [emailModal, setEmailModal] = useState('');
  const [phoneNumberModal, setPhoneNumberModal] = useState('');
  const customerTypesModal = CustomerTypes();
  const governmentIdTypesModal = GovernmentIdTypes();
  const [checkCustomersCompleted, setCheckCustomersCompleted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useShowCustomersQuery({ accountHolder, governmentId, accountStatus }, { refetchOnMountOrArgChange: true });
  const [pageNumber, setPageNumber] = useState(1);
  const itemsPerPage = 10;
  const [createCustomer, { isLoadingCreateCustomer }] = useCreateCustomerMutation();

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

  const selectStylesModal = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    control: (provided) => ({
      ...provided,
      fontSize: '12px',
    }),
  };

  const defaultSelectValueGovernmentIdTypesModal = () => ({
    label: "Seleccione un tipo de documento"
  });

  const defaultSelectValueCustomerTypesModal = () => ({
    label: "Seleccione un tipo de cliente"
  });

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

  const handleButtonOpenModal = () => {
    setGovernmentIdTypeModal('');
    setGovernmentIdModal('');
    setCustomerTypeModal('');
    setFirstNameModal('');
    setLastNameModal('');
    setBornDateModal('');
    setEmailModal('');
    setPhoneNumberModal('');
    setShow(true);
  }

  const handleCloseModal = () => setShow(false);

  const submitNewCustomert = async (e) => {
    e.preventDefault();
    try {
      const res = await createCustomer(({
        governmentIdType: governmentIdTypeModal,
        governmentId: governmentIdModal,
        customerType: customerTypeModal,
        lastName: lastNameModal,
        firstName: firstNameModal,
        bornDate: bornDateModal,
        email: emailModal,
        phoneNumber: phoneNumberModal,
      })).unwrap();
      toast.success(res.message);
      setShow(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
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
            <div className='box button-container mt-1 px-2 pb-2 pt-1' id='button-container'>
              <div className='box d-flex justify-content-center'>
                <Button variant="primary" size="sm" className="detail-button" onClick={handleAdvancedSearch}>
                  <span>Busqueda avanzada</span>
                </Button>
              </div>
              <div className='box d-flex justify-content-end'>
                <Button to="/customer/" variant="outline-primary" className="btn btn-custom d-flex align-items-center" size='sm' onClick={handleButtonOpenModal}>
                  <span className="plus-icon"><FaPlusCircle className='me-2' /></span>
                  <p className='mb-0 txt-btn-default'>Nuevo Cliente</p>
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
                      <td>{customer.user.isActive ? (`ACTIVO`) : (`BAJA`)}</td>
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

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" size='lg'>
        <Form onSubmit={submitNewCustomert}>
          <Modal.Header closeButton className='bg-dark text-white justify-content-center'>
            <Modal.Title>Nuevo Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="box">
              <div className="custom-grid-container">
                <hr className="my-1" />
                <div>
                  <Form.Group className='my-2'>
                    <h6 className='fw-bold h6-CardContainer'>Tipo Documento</h6>
                    <Select options={governmentIdTypesModal} onChange={(option) => setGovernmentIdTypeModal(option?.value || null)} styles={selectStylesModal}
                      defaultValue={defaultSelectValueGovernmentIdTypesModal} />
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2' controlId='governmentId'>
                    <Form.Label className='fw-bold'>N° Documento</Form.Label>
                    <Form.Control type='text' placeholder='Ingrese n° de documento' autoComplete='off' maxLength={11} required value={governmentIdModal} onChange={(e) => setGovernmentIdModal(e.target.value.toUpperCase())}></Form.Control>
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2'>
                    <h6 className='fw-bold h6-CardContainer'>Tipo de Cliente</h6>
                    <Select options={customerTypesModal} onChange={(option) => setCustomerTypeModal(option?.value || null)} styles={selectStylesModal}
                      defaultValue={defaultSelectValueCustomerTypesModal} />
                  </Form.Group>
                </div>
                <hr className="my-1" />
                <div>
                  <Form.Group className='my-2' controlId='lastName'>
                    <Form.Label className='fw-bold'>Apellido</Form.Label>
                    <Form.Control type='text' placeholder='Ingrese Apellido' autoComplete='off' required value={lastNameModal} onChange={(e) => setLastNameModal(e.target.value.toUpperCase())}></Form.Control>
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2' controlId='firstName'>
                    <Form.Label className='fw-bold'>Nombre</Form.Label>
                    <Form.Control type='text' placeholder='Ingrese Nombre' autoComplete='off' required value={firstNameModal} onChange={(e) => setFirstNameModal(e.target.value.toUpperCase())}></Form.Control>
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2' controlId='bornDate'>
                    <Form.Label className='fw-bold'>F. Nacimiento</Form.Label>
                    <Form.Control type='date' placeholder='Ingrese Nombre' autoComplete='off' required value={bornDateModal} onChange={(e) => setBornDateModal(e.target.value.toUpperCase())}></Form.Control>
                  </Form.Group>
                </div>
                <hr className="my-1" />
                <div>
                  <Form.Group className='my-2' controlId='email'>
                    <Form.Label className='fw-bold'>Email Address</Form.Label>
                    <Form.Control type='email' placeholder='Ingrese Mail' autoComplete='off' required value={emailModal} onChange={(e) => setEmailModal(e.target.value.toUpperCase())}></Form.Control>
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2' controlId='phoneNumber'>
                    <Form.Label className='fw-bold'>Telefono</Form.Label>
                    <Form.Control type='text' placeholder='Ingrese número de teléfono' autoComplete='off' required value={phoneNumberModal} onChange={(e) => setPhoneNumberModal(numberFormat(e.target.value))}></Form.Control>
                  </Form.Group>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type='submit' variant='success' disabled={!governmentIdTypeModal || !customerTypeModal}>
              Confirmar
            </Button>
          </Modal.Footer>
        </Form>
        {isLoadingCreateCustomer && <Loader />}
      </Modal>
    </div>
  );
};

export default Dashboard;