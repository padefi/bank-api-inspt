import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useUpdateUserPasswordMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({ show, onHide, userId }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatePassword, { isLoadingUpdatePassword }] = useUpdateUserPasswordMutation();

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
                onHide();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Form onSubmit={handleChangePassword}>
                <Modal.Header closeButton className='bg-dark text-white justify-content-center'>
                    <Modal.Title>Cambiar Contraseña</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='my-2' controlId='password'>
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control type='password' placeholder='Ingrese nueva contraseña' autoComplete='off' required value={password} minLength={6} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                    </Form.Group>
                    <Form.Group className='my-2' controlId='confirmPassword'>
                        <Form.Label>Confirmar nueva Contraseña</Form.Label>
                        <Form.Control type='password' placeholder='Confirmar nueva contraseña' autoComplete='off' required value={confirmPassword} minLength={6} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button type='submit' variant='success' disabled={!password || !confirmPassword}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Form>
            {isLoadingUpdatePassword && <Loader />}
        </Modal>
    );
};

export default ChangePasswordModal;