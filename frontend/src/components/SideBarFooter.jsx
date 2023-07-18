import { Dropdown } from "react-bootstrap";
import Sidebar from "react-bootstrap-sidebar-menu";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { useEffect, useState } from "react";
import UserRole from "../utils/userRole";

const SideBarFooter = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const data = UserRole();

    const isAdmin = data?.role === 'admin';
    const isEmployee = data?.role === 'empleado';
    const isCustomer = data?.role === 'cliente';

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Sidebar.Footer>
            <Dropdown as={Sidebar.Sub}>
                <Dropdown.Toggle variant="success" id="user-dropdown-toggle" className="dropdown-toggle-sidebar">
                    <FaUserCircle className="fa-circle-sidebar" />
                    <Sidebar.Nav.Title id='username'>{userInfo.userName}</Sidebar.Nav.Title>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item href='/profile'>Perfil</Dropdown.Item>
                    <Dropdown.Item onClick={logoutHandler}>Cerrar sesion</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Sidebar.Footer>
    );
};

export default SideBarFooter;