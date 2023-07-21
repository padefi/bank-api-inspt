import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBank } from "react-icons/bs";
import { Form, Button, Col, Card } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import loginImg from '../img/login.jpg';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const LoginScreen = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'empleado' || userInfo.role === 'admin') navigate('/bank/dashboard');
      else navigate('/customer/home');
    }
  }, [navigate, userInfo]);

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

  const handleForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ userName, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      if (res.role === 'empleado' || res.role === 'admin') navigate('/bank/dashboard');
      else navigate('/customer/home');
    } catch (err) {
      if (err?.data?.resetRequired) {
        setUserId(err.data.userId);
        setUserName('');
        setPassword('');
        setShowChangePasswordModal(true);
      }
      toast.error(err?.data?.message || err.error);
    }
  };

  if (localStorage.getItem('userMessage')) {
    toast.error('Sesion expirada');
  }

  localStorage.removeItem('userMessage');

  return (
    <FormContainer>
      <Col xs={12} md={6} className="d-flex align-items-center">
        <Card.Img id="LoginImg" className="d-block h-100 w-100" src={loginImg} alt="First slide" />
      </Col>
      <Col xs={12} md={6}>
        <Card.Body>

          <hr />
          <div className='d-flex flex-row m-2'>
            <BsBank className='login-icon' />
            <span className="h1 fw-bold my-2 mx-2 text-login-title">Banco INSPT-UTN</span>
          </div>
          <hr />

          <h5 className="fw-normal my-4 text-login">Inicio de sesión</h5>

          <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId='userName'>
              <Form.Control type='text' placeholder='Ingrese usuario' autoComplete='off' required value={userName} onChange={(e) => setUserName(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group className='my-2' controlId='password'>
              <Form.Control type='password' placeholder='Ingrese contraseña' autoComplete='off' required value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
            </Form.Group>

            <div className='my-2'>
              <Button type='submit' className="mt-2 px-5 w-100" variant='dark' disabled={!userName || !password}>
                Ingresar
              </Button>
            </div>
          </Form>

          <div>
            <a type='button' className="small text-muted" onClick={handleForgotPasswordModal}>¿Ha olvidado la contraseña?</a>
          </div>
        </Card.Body>
      </Col>

      {isLoading && <Loader />}

      <ChangePasswordModal show={showChangePasswordModal} onHide={handleCloseChangePasswordModal} userId={userId} />
      <ForgotPasswordModal show={showForgotPasswordModal} onHide={handleCloseForgotPasswordModal} />
    </FormContainer>

  );
};

export default LoginScreen;