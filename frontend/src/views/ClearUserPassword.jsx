import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsBank } from "react-icons/bs";
import { Form, Button, Col, Card } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import changePasswordImg from '../img/changePassword.jpg';
import { useGetUserClearPasswordQuery, useUpdateUserPasswordMutation } from '../slices/usersApiSlice';

const ClearUserPassword = () => {
    const { token } = useParams();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [checkUserInfoCompleted, setCheckUserInfoCompleted] = useState(false);
    const { data, error, isLoading, isFetching } = useGetUserClearPasswordQuery({ token });
    const navigate = useNavigate();
    const [updatePassword, { isLoadingUpdatePassword }] = useUpdateUserPasswordMutation();

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            if (data?.user?.userId) {
                setUserId(data.user.userId);
                setCheckUserInfoCompleted(true);
            }
        }
    }, [data, error]);

    if (!checkUserInfoCompleted) {
        return null;
    }

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (password && password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
        } else if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
        } else {
            try {
                const res = await updatePassword({ userId, password }).unwrap();
                toast.success(res.message);
                navigate('/login');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const user = data?.user || null;

    return (
        <FormContainer>
            <Col xs={12} md={6} className="d-flex align-items-center">
                <Card.Img id="LoginImg" className="d-block h-100 w-100" src={changePasswordImg} alt="First slide" />
            </Col>
            {isLoading || isFetching && <Loader />}
            {user && (
                <Col xs={12} md={6}>
                    <Card.Body>
                        <div className='d-flex flex-row m-2'>
                            <BsBank className='login-icon' />
                            <span className="h1 fw-bold my-2 mx-2 text-login-title">Banco INSPT-UTN</span>
                        </div>
                        <hr />

                        <h5 className="fw-normal my-4 text-login">Cambiar Contraseña</h5>

                        <Form onSubmit={handleChangePassword}>
                            <Form.Group className='my-2' controlId='password'>
                                <Form.Label>Nueva Contraseña</Form.Label>
                                <Form.Control type='password' placeholder='Ingrese nueva contraseña' autoComplete='off' required value={password} minLength={6} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                            </Form.Group>

                            <Form.Group className='my-2' controlId='confirmPassword'>
                                <Form.Label>Confirmar nueva Contraseña</Form.Label>
                                <Form.Control type='password' placeholder='Confirmar nueva contraseña' autoComplete='off' required value={confirmPassword} minLength={6} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                            </Form.Group>

                            <div className='my-2'>
                                <Button type='submit' className="mt-2 px-5 w-100" variant='success' disabled={!password || !confirmPassword}>
                                    Confirmar
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Col>
            )}

            {isLoading || isFetching && <Loader />}
            {isLoadingUpdatePassword && <Loader />}
        </FormContainer>

    );
};

export default ClearUserPassword;