import Sidebar from "react-bootstrap-sidebar-menu";
import { LinkContainer } from 'react-router-bootstrap';
import { FaArrowCircleDown, FaArrowCircleUp, FaDollarSign, FaHome, FaHotel, FaRegChartBar, FaShareSquare, FaWallet } from "react-icons/fa";
import { NavLink } from "react-bootstrap";
import UserRole from "../utils/userRole";

const SideBarBody = () => {
    const data = UserRole();

    const isAdmin = data?.role === 'admin';
    const isEmployee = data?.role === 'empleado';
    const isCustomer = data?.role === 'cliente';

    return (
        <Sidebar.Body>
            <Sidebar.Nav>
                <LinkContainer to={isCustomer ? '/customer/home' : '/bank/dashboard'}>
                    <NavLink className="sidebar-menu-nav-link">
                        <FaHome />
                        <Sidebar.Nav.Title>{isCustomer ? (`Posición consolidada`) : (`Inicio`)}</Sidebar.Nav.Title>
                    </NavLink>
                </LinkContainer>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaHotel />
                        <Sidebar.Nav.Title>Cuentas</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            <LinkContainer to='/customer/accounts'>
                                <NavLink className="sidebar-menu-nav-link">
                                    <FaWallet />
                                    <Sidebar.Nav.Title>{isCustomer ? (`Mis cuentas`) : (`Ver cuentas`)}</Sidebar.Nav.Title>
                                </NavLink>
                            </LinkContainer>
                            <LinkContainer to={isCustomer ? '/customer/accountSummary' : '/bank/accountSummary'}>
                                <NavLink className="sidebar-menu-nav-link">
                                    <FaRegChartBar />
                                    <Sidebar.Nav.Title>Resumen de Cuenta</Sidebar.Nav.Title>
                                </NavLink>
                            </LinkContainer>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaDollarSign />
                        <Sidebar.Nav.Title>Operaciones</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            {!isCustomer && (
                                <>
                                    <LinkContainer to='/bank/deposit'>
                                        <NavLink className="sidebar-menu-nav-link">
                                            <FaArrowCircleDown />
                                            <Sidebar.Nav.Title>Deposito</Sidebar.Nav.Title>
                                        </NavLink>
                                    </LinkContainer>
                                    <LinkContainer to="/bank/withdraw">
                                        <NavLink className="sidebar-menu-nav-link">
                                            <FaArrowCircleUp />
                                            <Sidebar.Nav.Title>Extraccion</Sidebar.Nav.Title>
                                        </NavLink>
                                    </LinkContainer>
                                </>
                            )}
                            <LinkContainer to={isCustomer ? '/customer/transfer' : '/bank/transfer'}>
                                <NavLink className="sidebar-menu-nav-link">
                                    <FaShareSquare />
                                    <Sidebar.Nav.Title>Transferencia</Sidebar.Nav.Title>
                                </NavLink>
                            </LinkContainer>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
            </Sidebar.Nav>
        </Sidebar.Body>
    );
};

export default SideBarBody;