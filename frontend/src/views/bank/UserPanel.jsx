import React, { useEffect, useState } from 'react';
import CardContainer from '../../components/CardContainer';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaUserEdit, FaWallet } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useGetUserRolesQuery, useShowUsersQuery } from '../../slices/usersApiSlice';
import Select from 'react-select';

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
  const [checkUsersCompleted, setCheckUsersCompleted] = useState(false);
  const { data, error, isLoading, isFetching } = useShowUsersQuery({ userData, userName, userType, userStatus }, { refetchOnMountOrArgChange: true });
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
      width: '250px',
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

  const users = data?.user || [];
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

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
                  <div className='box d-flex justify-content-between'>
                    <Form.Group className='mr-2 mb-2 flex-grow-1'>
                      <Form.Label htmlFor="userData" className='fw-bold detail-text mb-0'>Apellido y nombre:</Form.Label>
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
                      <td></td>
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
    </div >
  );
};

export default UserPanel;