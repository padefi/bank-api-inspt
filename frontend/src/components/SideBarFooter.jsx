import { Dropdown } from "react-bootstrap";
import Sidebar from "react-bootstrap-sidebar-menu";
import { FaUserCircle } from "react-icons/fa";

const SideBarFooter = () => {
    return (
        <Sidebar.Footer>
            <Dropdown as={Sidebar.Sub}>
                <Dropdown.Toggle variant="success" id="user-dropdown-toggle" className="dropdown-toggle-sidebar">
                    <FaUserCircle className="fa-circle-sidebar" />
                    <Sidebar.Nav.Title>User</Sidebar.Nav.Title>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item href="/profile">Perfil</Dropdown.Item>
                    <Dropdown.Item href="/logout">Logout</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </Sidebar.Footer>
    );
};

export default SideBarFooter;