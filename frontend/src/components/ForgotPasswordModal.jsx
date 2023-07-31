import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useForgotUserPasswordMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import Loader from './Loader';

const ForgotPasswordModal = ({ show, onHide }) => {
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sendEmail] = useForgotUserPasswordMutation();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const res = await sendEmail({ userName }).unwrap();
            toast.success(res.message);
            setUserName('');
            setIsLoading(false);
            onHide();
        } catch (err) {
            setIsLoading(false);
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Form onSubmit={handleForgotPassword}>
                <Modal.Header closeButton className='bg-dark text-white justify-content-center'>
                    <Modal.Title>Recuperar Contraseña</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='my-2' controlId='userName'>
                        <Form.Label>Usuario</Form.Label>
                        <Form.Control type='text' placeholder='Ingrese usuario' autoComplete='off' required value={userName} onChange={(e) => setUserName(e.target.value)}></Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button type='submit' variant='success' disabled={!userName || isLoading}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Form>
            {isLoading && <Loader />}
            <br />
        </Modal>
    );
};

export default ForgotPasswordModal;