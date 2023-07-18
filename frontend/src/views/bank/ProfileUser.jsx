import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { useGetProfileUserQuery, useUpdateProfileUserMutation } from '../../slices/usersApiSlice';
import UserRole from "../../utils/userRole";
import Select from 'react-select';
import CardContainer from '../../components/CardContainer';

const ProfileUser = () => {
    const [governmentId, setGovernmentId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bornDate, setBornDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [checkProfileCompleted, setCheckProfileCompleted] = useState(false);
    const { data, error, isLoading, isFetching, refetch } = useGetProfileUserQuery({}, { refetchOnMountOrArgChange: true });
    const [updateProfile, { isLoadingUpdate }] = useUpdateProfileUserMutation();

    const dataRole = UserRole();
    const isCustomer = dataRole?.role === 'customer';

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
            setGovernmentId(data?.governmentId.number || '');
            setLastName(data?.lastName.toUpperCase() || '');
            setFirstName(data?.firstName.toUpperCase() || '');
            setEmail(data?.email.toUpperCase() || '');
            setPhoneNumber(data?.phone || '');
            setBornDate(data?.bornDate ? (new Date(data.bornDate).toISOString().split("T")[0]) : (''));
            setCheckProfileCompleted(true);
        }
    }, [data, error]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if(password.length < 6){
            toast.error('La contraseña debe tener al menos 6 caracteres');
        }else if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
        } else {
            try {
                const res = await updateProfile(isCustomer ? ({
                    email,
                    phoneNumber,
                    bornDate,
                    password,
                }) : ({
                    phoneNumber,
                    bornDate,
                    password,
                })).unwrap();
                toast.success(res.message);
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const user = data || null;

    return (
        <div className='box'>
            <div className="d-flex justify-content-around mt-5">
                <CardContainer>
                    <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
                        <h2 className='card-title'>Perfil</h2>
                    </div>
                    {isLoading || isFetching && <Loader />}
                    {user && (
                        <Form onSubmit={submitHandler} className='mx-4 mb-4'>
                            <div className="box">
                                <div className="d-flex align-items-end justify-content-center">
                                    <div className="mr-2 mt-2">
                                        <strong>Usuario: </strong>{user.userName}
                                    </div>
                                </div>
                                <div className="custom-grid-container">
                                    <hr className="my-1" />
                                    <div>
                                        <Form.Group className='my-2'>
                                            <h6 className='fw-bold h6-CardContainer'>Tipo Documento</h6>
                                            <Select options={[{ value: user.governmentId.type.toUpperCase(), label: user.governmentId.type.toUpperCase() }]} styles={selectStyles}
                                                defaultValue={{ value: user.governmentId.type.toUpperCase(), label: user.governmentId.type.toUpperCase() }} isDisabled={true} />
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='governmentId'>
                                            <Form.Label className='fw-bold'>N° Documento</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese n° de documento' autoComplete='off' required defaultValue={governmentId} disabled></Form.Control>
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
                                            <Form.Control type='text' placeholder='Ingrese Apellido' autoComplete='off' required defaultValue={lastName} disabled></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='firstName'>
                                            <Form.Label className='fw-bold'>Nombre</Form.Label>
                                            <Form.Control type='text' placeholder='Ingrese Nombre' autoComplete='off' required defaultValue={firstName} disabled></Form.Control>
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
                                            <Form.Control type='email' placeholder='Ingrese Mail' autoComplete='off' required defaultValue={user.email.toUpperCase()} disabled={!isCustomer}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='password'>
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type='password' placeholder='Enter password' autoComplete='off' value={password} minLength={6} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <Form.Group className='my-2' controlId='confirmPassword'>
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control type='password' placeholder='Confirm password' autoComplete='off' value={confirmPassword} minLength={6} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </div>
                                </div>
                            </div>

                            <hr className='my-1' />

                            <div className='d-flex align-items-center justify-content-between mt-2'>
                                <Button type='submit' variant='primary'>
                                    Actualizar
                                </Button>
                            </div>

                            {isLoading && <Loader />}
                        </Form>
                    )}
                </CardContainer>
            </div>
        </div >
    );
};

export default ProfileUser;