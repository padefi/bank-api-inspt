import { Dropdown } from "react-bootstrap";
import Sidebar from "react-bootstrap-sidebar-menu";
import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const SideBarFooter = () => {
    const { userInfo } = useSelector((state) => state.auth);

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
                    <Sidebar.Nav.Title id='username'>{userInfo.firstName + ' ' + userInfo.lastName}</Sidebar.Nav.Title>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item href="/profile">Perfil</Dropdown.Item>
                    <Dropdown.Item onClick={logoutHandler}>Logout</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Sidebar.Footer>
    );
};

export default SideBarFooter;