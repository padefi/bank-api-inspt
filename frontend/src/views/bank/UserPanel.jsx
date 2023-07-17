import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaPlusCircle, FaUserEdit, FaWallet } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useCreateUserMutation, useGetUserRolesQuery, useShowUsersQuery } from '../../slices/usersApiSlice';
import Select from 'react-select';
import numberFormat from '../../utils/numberFormat';

const UserRoleOptions = ({ selectStyles, setUserRole }) => {
  const [getUserTypesCompleted, setGetUserTypesCompleted] = useState(false);
  const { data, error } = useGetUserRolesQuery({}, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      setGetUserTypesCompleted(true);
    }
  }, [data, error]);

  if (!getUserTypesCompleted) {
    return null;
  }

  const roles = data?.roles || [];

  let options = roles.map((role) => ({
    value: `${role._id}`,
    label: `${role.name.toUpperCase()}`,
  }));

  options = [{ value: '', label: 'TODAS' }, ...options];

  return (
    <Select options={options} onChange={(option) => setUserRole(option?.value || null)} styles={selectStyles} menuPortalTarget={document.body} defaultValue={options[0]} />
  );
}

const UserStatusOptions = () => {
  const options = [
    { value: '', label: 'TODOS' },
    { value: 'true', label: 'ACTIVO' },
    { value: 'false', label: 'BAJA' }
  ]

  return options;
}

const UserPanel = () => {
  useCheckCookies();
  useSessionTimeout();
  const navigate = useNavigate();
  const [userData, setUserData] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const userStatusOptions = UserStatusOptions();
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [showModal, setShow] = useState(false);
  const [governmentIdTypeModal, setGovernmentIdTypeModal] = useState('cuil');
  const [governmentIdModal, setGovernmentIdModal] = useState('');
  const [firstNameModal, setFirstNameModal] = useState('');
  const [lastNameModal, setLastNameModal] = useState('');
  const [bornDateModal, setBornDateModal] = useState('');
  const [phoneNumberModal, setPhoneNumberModal] = useState('');
  const [checkUsersCompleted, setCheckUsersCompleted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useShowUsersQuery({ userData, userName, userType, userStatus }, { refetchOnMountOrArgChange: true });
  const [pageNumber, setPageNumber] = useState(1);
  const itemsPerPage = 10;
  const [createUser, { isLoadingCreateUser }] = useCreateUserMutation();

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
      width: '250px',
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

  const handleAdvanced = () => {
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || error.error);
    } else {
      setCheckUsersCompleted(true);
    }
  }, [error]);

  if (!checkUsersCompleted) {
    return null;
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(data?.users?.length / itemsPerPage);
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleClickUser = (userId) => {
    navigate(`/bank/userProfile/${userId}`);
  };

  const handleButtonOpenModal = () => {
    setGovernmentIdTypeModal('cuil');
    setGovernmentIdModal('');
    setFirstNameModal('');
    setLastNameModal('');
    setBornDateModal('');
    setPhoneNumberModal('');
    setShow(true);
  }

  const handleCloseModal = () => setShow(false);

  const submitNewUser = async (e) => {
    e.preventDefault();
    try {
      const res = await createUser(({
        governmentIdType: governmentIdTypeModal,
        governmentId: governmentIdModal,
        lastName: lastNameModal,
        firstName: firstNameModal,
        bornDate: bornDateModal,
        phoneNumber: phoneNumberModal,
      })).unwrap();
      toast.success('Cliente creado exitosamente!');
      setShow(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const users = data?.user || [];
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return (
    <div className='box'>
      <div className="d-flex justify-content-around mt-5">
        <CardContainer id="BankCardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Usuarios</h2>
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
                  <p className='mb-0 txt-btn-default'>Nuevo Usuario</p>
                </Button>
              </div>
            </div>
            <div className={`box advanced-search d-flex justify-content-center mb-2 ${advancedSearch ? 'advanced-search-visible' : 'advanced-search-hidden'}`}>
              <Row className='justify-content-center'>
                <Col>
                  <div className='box d-flex justify-content-between'>
                    <Form.Group className='mr-2 mb-2 flex-grow-1'>
                      <Form.Label htmlFor="userData" className='fw-bold detail-text mb-0'>Apellido/Nombre:</Form.Label>
                      <Form.Control id="userData" type="text" className="form-control form-control" value={userData} onChange={(e) => { setUserData(e.target.value.toUpperCase()); handleAdvanced; }} />
                    </Form.Group>
                    <Form.Group className='flex-grow-1'>
                      <Form.Label htmlFor="userName" className='fw-bold detail-text mb-0'>Usuario:</Form.Label>
                      <Form.Control id="userName" type='text' className="form-control form-control" value={userName} onChange={(e) => { setUserName(e.target.value); handleAdvanced; }} />
                    </Form.Group>
                  </div>
                  <div className='box d-flex justify-content-between'>
                    <Form.Group className='flex-grow-1 mr-1'>
                      <div className='fw-bold detail-text mt-1'>Tipo usuario:</div>
                      <UserRoleOptions selectStyles={selectStyles} setUserRole={setUserRole} />
                    </Form.Group>
                    <Form.Group className='flex-grow-1 ml-1'>
                      <div className='fw-bold detail-text mt-1'>Estado:</div>
                      <Select options={userStatusOptions} onChange={(userStatusOptions) => { setUserStatus(userStatusOptions?.value || null); handleAdvanced; }} styles={selectStyles}
                        menuPortalTarget={document.body} defaultValue={userStatusOptions[0]} />
                    </Form.Group>
                  </div>
                </Col>
              </Row>
            </div>
            <Table striped bordered hover className='mb-0'>
              <thead>
                <tr>
                  <th>Apellido y nombre</th>
                  <th>Usuario</th>
                  <th>Tipo usuario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {paginatedUsers.length > 0 ? (
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.lastName.toUpperCase()} {user.firstName.toUpperCase()}</td>
                      <td>{user.userName.toUpperCase()}</td>
                      <td>{user.role.name.toUpperCase()}</td>
                      <td>{user.isActive ? (`ACTIVO`) : (`BAJA`)}</td>
                      <td>
                        <div className='box d-flex justify-content-center'>
                          <Button variant="outline-success" title="Editar cliente" size="sm" onClick={() => handleClickUser(user._id)}><FaUserEdit /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={4}><h5 className="h-striped">No se encontraron usuarios</h5></td>
                  </tr>
                </tbody>
              )}
            </Table>
          </div>
          <div className="box mt-2 text-center mb-1">
            <Button variant="outline-primary" onClick={handlePreviousPage} disabled={pageNumber === 1} size='sm' className='mr-2'><FaArrowLeft /></Button>
            <Button variant="outline-primary" onClick={handleNextPage} disabled={pageNumber === Math.ceil(users.length / itemsPerPage)} size='sm'><FaArrowRight /></Button>
          </div>
        </CardContainer>
      </div >

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" size='lg'>
        <Form onSubmit={submitNewUser}>
          <Modal.Header closeButton className='bg-dark text-white justify-content-center'>
            <Modal.Title>Nuevo Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="box">
              <div className="custom-grid-container">
                <hr className="my-1" />
                <div>
                  <Form.Group className='my-2'>
                    <h6 className='fw-bold h6-CardContainer'>Tipo Documento</h6>
                    <Select options={[{ value: 'cuil', label: 'CUIL' }]} styles={selectStylesModal} defaultValue={{ value: 'cuil', label: 'CUIL' }}/>
                  </Form.Group>
                </div>
                <div>
                  <Form.Group className='my-2' controlId='governmentId'>
                    <Form.Label className='fw-bold'>N° Documento</Form.Label>
                    <Form.Control type='text' placeholder='Ingrese n° de documento' autoComplete='off' minLength={11} maxLength={11} required value={governmentIdModal} onChange={(e) => setGovernmentIdModal(numberFormat(e.target.value))}></Form.Control>
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
            <Button type='submit' variant='success'>
              Confirmar
            </Button>
          </Modal.Footer>
        </Form>
        {isLoadingCreateUser && <Loader />}
      </Modal>
    </div >
  );
};

export default UserPanel;