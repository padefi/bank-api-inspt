import Sidebar from "react-bootstrap-sidebar-menu";
import { LinkContainer } from 'react-router-bootstrap';
import { FaArrowCircleDown, FaArrowCircleUp, FaDollarSign, FaHome, FaHotel, FaRegChartBar, FaRegListAlt, FaShareSquare, FaWallet } from "react-icons/fa";

const SideBarBody = () => {
    return (
        <Sidebar.Body>
            <Sidebar.Nav>
                <LinkContainer to='/'>
                    <FaHome />
                    <Sidebar.Nav.Title>Principal</Sidebar.Nav.Title>
                </LinkContainer>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaHotel />
                        <Sidebar.Nav.Title>Cuentas</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            <LinkContainer to='/'>
                                <FaDollarSign />
                                <Sidebar.Nav.Title>Saldos</Sidebar.Nav.Title>
                            </LinkContainer>
                            <LinkContainer to='/'>
                                <FaRegListAlt />
                                <Sidebar.Nav.Title>Movimientos</Sidebar.Nav.Title>
                            </LinkContainer>
                            <LinkContainer to='/'>
                                <FaRegChartBar />
                                <Sidebar.Nav.Title>Resumen de Cuenta</Sidebar.Nav.Title>
                            </LinkContainer>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaWallet />
                        <Sidebar.Nav.Title>Operaciones</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            <LinkContainer to='/'>
                                <FaArrowCircleDown />
                                <Sidebar.Nav.Title>Deposito</Sidebar.Nav.Title>
                            </LinkContainer>
                            <LinkContainer to='/'>
                                <FaArrowCircleUp />
                                <Sidebar.Nav.Title>Extraccion</Sidebar.Nav.Title>
                            </LinkContainer>
                            <LinkContainer to='/'>
                                <FaShareSquare />
                                <Sidebar.Nav.Title>Transferencia</Sidebar.Nav.Title>
                            </LinkContainer>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
            </Sidebar.Nav>
        </Sidebar.Body>
    );
};

export default SideBarBody;