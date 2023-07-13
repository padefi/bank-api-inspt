import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import CardContainer from '../../components/CardContainer';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { setCredentials } from '../../slices/authSlice';
import { useGetCustomerProfileQuery, useUpdateCustomerMutation } from '../../slices/customerApiSlice';
import { useUnlockUserMutation, useLockUserMutation } from '../../slices/usersApiSlice';
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';
import UserRole from "../../utils/userRole";
import { useParams } from 'react-router-dom';
import Select from 'react-select';

const CustomerTypes = () => {
    const options = [
        { value: 'PC', label: 'PERSONA FISICA' },
        { value: 'CC', label: 'PERSONA JURIDICA' }
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

const CustomerProfile = () => {
    useCheckCookies();
    useSessionTimeout();
    const { id } = useParams();
    const [governmentIdType, setGovernmentIdType] = useState('');
    const [governmentId, setGovernmentId] = useState('');
    const [customerType, setCustomerType] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bornDate, setBornDate] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const customerTypes = CustomerTypes();
    const governmentIdTypes = GovernmentIdTypes();
    const [checkProfileCompleted, setCheckProfileCompleted] = useState(false);
    const { data, error, isLoading, isFetching, refetch } = useGetCustomerProfileQuery({ id: id });
    const [lockUser, { isLoading: isLoadingLockUser }] = useLockUserMutation();
    const [unlockUser, { isLoading: isLoadingUnlockUser }] = useUnlockUserMutation();

    const dispatch = useDispatch();
    const [updateCustomerProfile, { isLoadingUpdate }] = useUpdateCustomerMutation();

    const dataRole = UserRole();
    const isAdmin = dataRole?.role === 'admin';

    const selectStyles = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
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
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
        } else {
            try {
                const res = await updateCustomerProfile({
                    _id: userInfo._id,
                    firstName,
                    lastName,
                    email,
                    password,
                }).unwrap();
                dispatch(setCredentials({ ...res }));
                toast.success('Perfil actualizado exitosamente!');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const customer = data?.customer || null;

    return (
        <div className='box'>
            <div className="d-flex justify-content-around mt-5">
                <CardContainer>
                    <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
                        <h2 className='card-title'>Perfil del cliente</h2>
                    </div>
                    {isLoading || isFetching && <Loader />}
                    {customer && (
                        <Form onSubmit={submitHandler} className='mx-4 mb-4'>
                            <div className="box">
                                <div className="d-flex align-items-end justify-content-center">
                                    <div className="mr-2 mt-2">
                                        <strong>N° cliente: </strong>{customer.number}
                                    </div>
                                </div>
                                <hr className='my-1' />
                                <div className="d-flex justify-content-between">
                                    <div className="mr-2">
                                        <Form.Group className='my-2'>
                                            <h6 className='fw-bold h6-CardContainer'>Tipo Documento</h6>
                                            <Select className='input2-CardContainer' options={governmentIdTypes} onChange={(option) => setGovernmentIdType(option?.value || null)} styles={selectStyles} defaultValue={governmentIdTypes.find((option) => option.value === customer.user.governmentId.type)} />
                                        </Form.Group>
                                    </div>
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='governmentId'>
                                            <Form.Label className='fw-bold'>N° Documento</Form.Label>
                                            <Form.Control type='text' className='input2-CardContainer' placeholder='Ingrese n° de documento' autoComplete='off' value={customer.user.governmentId.number} onChange={(e) => setGovernmentId(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div className="mr-2">
                                        <Form.Group className='my-2'>
                                            <h6 className='fw-bold h6-CardContainer'>Tipo de Cliente</h6>
                                            <Select className='input1-CardContainer' options={customerTypes} onChange={(option) => setCustomerType(option?.value || null)} styles={selectStyles} defaultValue={customerTypes.find((option) => option.value === customer.type)} />
                                        </Form.Group>
                                    </div>
                                </div>
                                <hr className='my-1' />
                                <div className="d-flex justify-content-between">
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='lastName'>
                                            <Form.Label className='fw-bold'>Apellido</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Apellido' autoComplete='off' value={customer.user.lastName} onChange={(e) => setLastName(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='firstName'>
                                            <Form.Label className='fw-bold'>Nombre</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Nombre' autoComplete='off' value={customer.user.firstName} onChange={(e) => setFirstName(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='bornDate'>
                                            <Form.Label className='fw-bold'>F. Nacimiento</Form.Label>
                                            <Form.Control type='date' placeholder='Ingrese Nombre' autoComplete='off' value={new Date(customer.user.bornDate).toISOString().split("T")[0]} onChange={(e) => setBornDate(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                </div>
                                <hr className='my-1' />
                                <div className="d-flex">
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='email'>
                                            <Form.Label className='fw-bold'>Email Address</Form.Label>
                                            <Form.Control type='email' placeholder='Ingrese Mail' autoComplete='off' value={customer.user.email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div className="mr-2">
                                        <Form.Group className='my-2' controlId='phoneNumber'>
                                            <Form.Label className='fw-bold'>Telefono</Form.Label>
                                            <Form.Control type='number' placeholder='Ingrese número de teléfono' autoComplete='off' value={customer.user.phone} onChange={(e) => setPhoneNumber(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>

                            <div className='d-flex align-items-center justify-content-between mt-2'>
                                <Button type='submit' variant='primary'>
                                    Actualizar
                                </Button>
                                {customer.user.isActive && isAdmin ? (
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

export default CustomerProfile;