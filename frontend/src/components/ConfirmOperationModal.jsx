import { Button, Container, Form, Modal } from 'react-bootstrap';
import { FaCheckCircle } from "react-icons/fa";
import { BsFillPrinterFill } from "react-icons/bs";
import { pdf } from '@react-pdf/renderer';
import OperationReceipt from './OperationReceipt';

const ConfirmOperationModal = ({ state, type, desc, date, origin, destination, amountFromData, amountToData, acronym, tax, onCloseModal }) => {

    const handleClose = () => {
        onCloseModal();
    };

    const handleDownloadPDF = async () => {
        const blob = await pdf(<OperationReceipt type={type}
            desc={desc}
            date={date}
            origin={origin}
            destination={destination}
            amountFromData={amountFromData}
            amountToData={amountToData}
            acronym={acronym}
            tax={tax}
        />).toBlob();

        const url = URL.createObjectURL(blob);
        /* window.open(url, '_blank'); // Abre el PDF en una nueva pestaña */
        const link = document.createElement('a');
        link.href = url;
        link.download = date + '.pdf';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal show={state} backdrop="static" onHide={handleClose}>
            <Modal.Header closeButton className='bg-dark text-white btn-close-white'>
                <Modal.Title>Comprobante de operación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container className='border border-2 p-3'>
                    <div className='d-grid justify-content-center align-items-center'>
                        <h6 className='fw-bold'>{type === 'Deposito' ? (<>{type} realizado</>) : (<>{type} realizada</>)} con éxito</h6>
                        <div className='d-flex justify-content-center'>
                            <FaCheckCircle className='modal-icon' />
                        </div>
                    </div>
                    <hr className='mb-4' />
                    <div className='d-grid justify-content-left'>
                        <p className='mb-2'>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(date)).replace(/,/g, " -")}</p>
                        {type === 'Transferencia' ? (
                            <>
                                <p className='mb-2'><strong>Origen: </strong>{origin}</p>
                                <p className='mb-2'><strong>Destino: </strong>{destination}</p>
                            </>
                        ) : (<p className='mb-2'><strong>Cuenta: </strong>{origin}</p>)}
                        <>
                            <p className='mb-2'><strong>Importe: </strong>{amountFromData.toLocaleString("es-AR", { style: "currency", currency: acronym })}</p>
                            {tax > 0 &&
                                <>
                                    <p className='mb-2'><strong>Impuestos: </strong>{tax.toLocaleString("es-AR", { style: "currency", currency: acronym })} (0.5%)</p>
                                    <p className='mb-2'><strong>Importe {desc}: </strong>{amountToData.toLocaleString("es-AR", { style: "currency", currency: acronym })}</p>
                                </>
                            }
                        </>
                    </div>
                </Container>
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center align-items-center'>
                <Button type='submit' variant='secondary' onClick={handleDownloadPDF}>
                    <BsFillPrinterFill className='printer-icon' />
                    Descargar
                </Button>
            </Modal.Footer>
        </Modal >
    );
};

export default ConfirmOperationModal;