import Sidebar from "react-bootstrap-sidebar-menu";
import { LinkContainer } from 'react-router-bootstrap';
import { FaArrowCircleDown, FaArrowCircleUp, FaDollarSign, FaHome, FaHotel, FaRegChartBar, FaRegListAlt, FaShareSquare, FaWallet } from "react-icons/fa";

const SideBarBody = () => {
    return (
        <Sidebar.Body>
            <Sidebar.Nav>
                <Sidebar.Nav.Link href="/home">
                    <FaHome />
                    <Sidebar.Nav.Title>Posición consolidada</Sidebar.Nav.Title>
                </Sidebar.Nav.Link>
                <Sidebar.Sub>
                    <Sidebar.Sub.Toggle>
                        <FaHotel />
                        <Sidebar.Nav.Title>Cuentas</Sidebar.Nav.Title>
                    </Sidebar.Sub.Toggle>
                    <Sidebar.Sub.Collapse>
                        <Sidebar.Nav>
                            <Sidebar.Nav.Link href="/accounts">
                                <FaWallet />
                                <Sidebar.Nav.Title>Mis cuentas</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
                            <Sidebar.Nav.Link href="/movimientos">
                                <FaRegListAlt />
                                <Sidebar.Nav.Title>Movimientos</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
                            <Sidebar.Nav.Link href="/resumen">
                                <FaRegChartBar />
                                <Sidebar.Nav.Title>Resumen de Cuenta</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
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
                            <Sidebar.Nav.Link href="/">
                                <FaArrowCircleDown />
                                <Sidebar.Nav.Title>Deposito</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
                            <Sidebar.Nav.Link href="/">
                                <FaArrowCircleUp />
                                <Sidebar.Nav.Title>Extraccion</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
                            <Sidebar.Nav.Link href="/">
                                <FaShareSquare />
                                <Sidebar.Nav.Title>Transferencia</Sidebar.Nav.Title>
                            </Sidebar.Nav.Link>
                        </Sidebar.Nav>
                    </Sidebar.Sub.Collapse>
                </Sidebar.Sub>
            </Sidebar.Nav>
        </Sidebar.Body>
    );
};

export default SideBarBody;