import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import CardContainer from '../../components/CardContainer';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { useUnlockUserMutation, useLockUserMutation, useGetUserProfileQuery, useGetUserRolesQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import UserRole from "../../utils/userRole";
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import numberFormat from '../../utils/numberFormat';
import { useSelector } from 'react-redux';

const UserRoleOptions = () => {
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

    return options
}

const UserProfile = () => {
    useCheckCookies();
    useSessionTimeout();
    const { id } = useParams();
    const [governmentId, setGovernmentId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bornDate, setBornDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const userRoleOptions = UserRoleOptions();
    const [userRole, setUserRole] = useState('');
    const [checkProfileCompleted, setCheckProfileCompleted] = useState(false);
    const { data, error, isLoading, isFetching, refetch } = useGetUserProfileQuery({ id: id });
    const [lockUser, { isLoading: isLoadingLockUser }] = useLockUserMutation();
    const [unlockUser, { isLoading: isLoadingUnlockUser }] = useUnlockUserMutation();
    const [updateUserProfile, { isLoadingUpdate }] = useUpdateUserMutation();
    const { userInfo } = useSelector((state) => state.auth);

    const dataRole = UserRole();
    const isAdmin = dataRole?.role === 'admin';

    const selectStyles = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isDisabled ? '#f9f9f9' : 'white',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        }),
    };

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            setGovernmentId(data?.user.governmentId.number || '');
            setBornDate(data?.user.bornDate ? (new Date(data.user.bornDate).toISOString().split("T")[0]) : (''));
            setLastName(data?.user.lastName.toUpperCase() || '');
            setFirstName(data?.user.firstName.toUpperCase() || '');
            setPhoneNumber(data?.user.phone || '');
            setUserRole(data?.user.role._id || '');
            setCheckProfileCompleted(true);
        }
    }, [data, error]);

    if (!checkProfileCompleted) {
        return null;
    }

    const handleLockUser = async (e) => {
        e.preventDefault();
        try {
            const res = await lockUser({ userId: id }).unwrap();
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleUnlockUser = async (e) => {
        e.preventDefault();
        try {
            const res = await unlockUser({ userId: id }).unwrap();
            toast.success(res.message);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await updateUserProfile(isAdmin && ({
                userId: id,
                governmentId,
                bornDate,
                lastName,
                firstName,
                phoneNumber,
                userRole,
            })).unwrap();
            toast.success(res.message);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const user = data?.user || null;

    return (
        <div className='box'>
            <div className="d-flex justify-content-around mt-5">
                <CardContainer>
                    <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
                        <h2 className='card-title'>Perfil del Usuario</h2>
                    </div>
                    {isLoading || isFetching && <Loader />}
                    {user && (
                        <Form onSubmit={submitHandler} className='mx-4 mb-4'>
                            <div className="box">
                                <div className="custom-grid-container">
                                    <div>
                                        <Form.Group className='my-2'>
                                            <h6 className='fw-bold h6-CardContainer'>Tipo Documento</h6>
                                            <Select options={[{ value: 'cuil', label: 'CUIL' }]} styles={selectStyles} defaultValue={{ value: 'cuil', label: 'CUIL' }} isDisabled={true} />
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='governmentId'>
                                            <Form.Label className='fw-bold'>N° Documento</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese n° de documento' autoComplete='off' maxLength={11} required value={governmentId} onChange={(e) => setGovernmentId(e.target.value.toUpperCase())}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='bornDate'>
                                            <Form.Label className='fw-bold'>F. Nacimiento</Form.Label>
                                            <Form.Control type='date' placeholder='Ingrese Nombre' autoComplete='off' required value={bornDate} onChange={(e) => setBornDate(e.target.value.toUpperCase())}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <hr className='my-1' />
                                    <div>
                                        <Form.Group className='my-2' controlId='lastName'>
                                            <Form.Label className='fw-bold'>Apellido</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Apellido' autoComplete='off' required value={lastName} onChange={(e) => setLastName(e.target.value.toUpperCase())}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='firstName'>
                                            <Form.Label className='fw-bold'>Nombre</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Nombre' autoComplete='off' required value={firstName} onChange={(e) => setFirstName(e.target.value.toUpperCase())}></Form.Control>
                                        </Form.Group>
                                    </div>

                                    <div>
                                        <Form.Group className='my-2' controlId='phoneNumber'>
                                            <Form.Label className='fw-bold'>Telefono</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese número de teléfono' autoComplete='off' required value={phoneNumber} onChange={(e) => setPhoneNumber(numberFormat(e.target.value))}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <hr className='my-1' />
                                    <div>
                                        <Form.Group className='my-2' controlId='email'>
                                            <Form.Label className='fw-bold'>Email Address</Form.Label>
                                            <Form.Control type='email' placeholder='Ingrese Mail' autoComplete='off' required value={user.email.toUpperCase()} disabled></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='userName'>
                                            <Form.Label className='fw-bold'>Usuario</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Nombre' autoComplete='off' required value={user.userName.toUpperCase()} disabled></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='userRol'>
                                            <h6 className='fw-bold h6-CardContainer'>Tipo Usuario</h6>
                                            <Select options={userRoleOptions} onChange={(option) => setUserRole(option?.value)} styles={selectStyles} menuPortalTarget={document.body}
                                                defaultValue={userRoleOptions.find((option) => option.label === user.role.name.toUpperCase())} isDisabled={user.userName === userInfo.userName}/>
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>

                            <hr className='my-1' />

                            <div className='d-flex align-items-center justify-content-between mt-2'>
                                <Button type='submit' variant='primary'>
                                    Actualizar
                                </Button>
                                {user.isActive && isAdmin ? (
                                    <>
                                        <Button variant="outline-danger" className="btn btn-custom d-flex align-items-center" onClick={handleLockUser}>
                                            <p className='mb-0 txt-btn-default'>Bloquear usuario</p>
                                        </Button>
                                        {isLoadingLockUser && <Loader />}
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline-success" className="btn btn-custom d-flex align-items-center" onClick={handleUnlockUser}>
                                            <p className='mb-0 txt-btn-default'>Desbloquear usuario</p>
                                        </Button>
                                        {isLoadingUnlockUser && <Loader />}
                                    </>
                                )}
                            </div>

                            {isLoadingUpdate && <Loader />}
                        </Form>
                    )}
                </CardContainer>
            </div>
        </div>
    );
};

export default UserProfile;