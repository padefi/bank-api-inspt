import Sidebar from "react-bootstrap-sidebar-menu";
import { LinkContainer } from 'react-router-bootstrap';
import { FaArrowCircleDown, FaArrowCircleUp, FaDollarSign, FaHome, FaHotel, FaRegChartBar, FaRegListAlt, FaShareSquare, FaWallet } from "react-icons/fa";
import { NavLink } from "react-bootstrap";

const SideBarBody = () => {
    return (
        <Sidebar.Body>
            <Sidebar.Nav>
                <LinkContainer to="/home">
                    <NavLink className="sidebar-menu-nav-link">
                        <FaHome />
                        <Sidebar.Nav.Title>Posición consolidada</Sidebar.Nav.Title>
                    </NavLink>
                </LinkContainer>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaHotel />
                        <Sidebar.Nav.Title>Cuentas</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            <LinkContainer to="/accounts">
                                <NavLink className="sidebar-menu-nav-link">
                                    <FaWallet />
                                    <Sidebar.Nav.Title>Mis cuentas</Sidebar.Nav.Title>
                                </NavLink>
                            </LinkContainer>
                            <LinkContainer to="/movimientos">
                                <Sidebar.Nav.Link>
                                    <FaRegListAlt />
                                    <Sidebar.Nav.Title>Movimientos</Sidebar.Nav.Title>
                                </Sidebar.Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/resumen">
                                <Sidebar.Nav.Link>
                                    <FaRegChartBar />
                                    <Sidebar.Nav.Title>Resumen de Cuenta</Sidebar.Nav.Title>
                                </Sidebar.Nav.Link>
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
                            <LinkContainer to="/">
                                <Sidebar.Nav.Link>
                                    <FaArrowCircleDown />
                                    <Sidebar.Nav.Title>Deposito</Sidebar.Nav.Title>
                                </Sidebar.Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/">
                                <Sidebar.Nav.Link>
                                    <FaArrowCircleUp />
                                    <Sidebar.Nav.Title>Extraccion</Sidebar.Nav.Title>
                                </Sidebar.Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/">
                                <Sidebar.Nav.Link>
                                    <FaShareSquare />
                                    <Sidebar.Nav.Title>Transferencia</Sidebar.Nav.Title>
                                </Sidebar.Nav.Link>
                            </LinkContainer>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
            </Sidebar.Nav>
        </Sidebar.Body>
    );
};

export default SideBarBody;