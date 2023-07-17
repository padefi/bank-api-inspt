import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { useGetProfileUserQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import Select from 'react-select';

const ProfileUser = () => {
    const [governmentId, setGovernmentId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bornDate, setBornDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { data, error, isLoading, isFetching, refetch } = useGetProfileUserQuery();

    const dispatch = useDispatch();
    const [updateProfile, { isLoadingUpdate }] = useUpdateUserMutation();

    const { userInfo } = useSelector((state) => state.auth);

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
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
        setEmail(userInfo.email);
    }, [userInfo.firstName, userInfo.lastName, userInfo.email]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
        } else {
            try {
                const res = await updateProfile({
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

    console.log(data);
    return;

    return (
        <FormContainer>
            <h1>Perfil del usuario</h1>

            <Form onSubmit={submitHandler}>
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
                                    defaultValue={userRoleOptions.find((option) => option.label === user.role.name.toUpperCase())} />
                            </Form.Group>
                        </div>
                    </div>
                </div>
                <Form.Group className='my-2' controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type='password' placeholder='Enter password' autoComplete='off' value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                </Form.Group>
                <Form.Group className='my-2' controlId='confirmPassword'>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type='password' placeholder='Confirm password' autoComplete='off' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                </Form.Group>

                <Button type='submit' variant='primary' className='mt-3'>
                    Actualizar
                </Button>

                {isLoading && <Loader />}
            </Form>
        </FormContainer>
    );
};

export default ProfileUser;