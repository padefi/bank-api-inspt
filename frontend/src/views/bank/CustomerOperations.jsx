import React, { useEffect, useState } from 'react';
import { useGetCustomerAccountsQuery } from '../../slices/accountApiSlice';
import CardContainer from '../../components/CardContainer';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaShareSquare, FaTimes } from "react-icons/fa";
import useCheckCookies from '../../utils/useCheckCookies';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import useSessionTimeout from '../../utils/useSessionTimeout';
import { useNavigate, useParams } from 'react-router-dom';
import { useShowAccountOperationsQuery } from '../../slices/operationApiSlice';
import Select from 'react-select';

const CustomerOperations = () => {
    useCheckCookies();
    useSessionTimeout();
    const { id } = useParams();
    const [checkAccountsCompleted, setCheckAccountsCompleted] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [operationType, setOperationType] = useState('');
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const { data, error, isLoading, isFetching, refetch } = useShowAccountOperationsQuery({ accountFrom: id, dateFrom, dateTo, operationType }, { refetchOnMountOrArgChange: true });
    const [pageNumber, setPageNumber] = useState(1);
    const itemsPerPage = 10;

    const optionsOperationType = [
        { value: '', label: 'Todas' },
        { value: 'deposito', label: 'Deposito' },
        { value: 'extraccion', label: 'Extraccion' },
        { value: 'transferencia', label: 'Transferencia' }
    ];

    const handleAdvancedSearch = () => {
        setAdvancedSearch(!advancedSearch);
    };

    const selectStyles = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '12px',
        }),
    };

    const defaultSelectValue = () => ({
        value: '',
        label: "Todas",
    });

    const handleAdvanced = () => {
        refetch();
    };

    useEffect(() => {
        if (error) {
            toast.error(error.data?.message || error.error);
        } else {
            setCheckAccountsCompleted(true);
        }
    }, [data, error]);

    if (!checkAccountsCompleted) {
        return null;
    }

    const handleNextPage = () => {
        const totalPages = Math.ceil(data?.operationDataArray?.length / itemsPerPage);
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const account = data || null;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOperations = account?.operationDataArray?.slice(startIndex, endIndex);

    return (
        <div className='box'>
            <div className="d-flex justify-content-around mt-5">
                <CardContainer id="BankCardContainer">
                    <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
                        <h2 className='card-title'>Operaciones</h2>
                    </div>
                    {isLoading || isFetching && <Loader />}
                    {account ? (
                        <div className='box-details'>
                            <div className='box button-container mt-1 px-2 pb-2 pt-1 d-flex justify-content-between'>
                                <div className='box'>
                                    <p className='d-inline fw-bold mb-0 box-text text-cuenta'>
                                        {account.type}
                                        <span> {account.currency.symbol} </span>
                                        {account.accountId.substring(3, 7)} - {account.accountId.substring(11, 21)}
                                    </p>
                                </div>
                                <div className='box mr-4'>
                                    <Button variant="primary" size="sm" className="detail-button" onClick={handleAdvancedSearch}>
                                        <span>Busqueda avanzada</span>
                                    </Button>
                                </div>
                                <div className='box'>
                                    <p className='fw-bold'>Saldo: {account.accountBalance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</p>
                                </div>
                            </div>
                            <div className={`box advanced-search d-flex justify-content-center mb-2 ${advancedSearch ? 'advanced-search-visible' : 'advanced-search-hidden'}`}>
                                <Row className='justify-content-center'>
                                    <Col>
                                        <div className='box d-flex justify-content-between'>
                                            <Form.Group className='mr-2 mb-2'>
                                                <Form.Label htmlFor="dateFrom" className='fw-bold detail-text'>Fecha desde:</Form.Label>
                                                <Form.Control id="dateFrom" type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); handleAdvanced; }} />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label htmlFor="dateTo" className='fw-bold detail-text'>Fecha hasta:</Form.Label>
                                                <Form.Control id="dateTo" type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); handleAdvanced; }} />
                                            </Form.Group>
                                        </div>
                                        <Form.Group>
                                            <div className='fw-bold detail-text'>Tipo de operación:</div>
                                            <Select options={optionsOperationType} onChange={(optionsOperationType) => { setOperationType(optionsOperationType?.value || null); handleAdvanced; }} styles={selectStyles}
                                                menuPortalTarget={document.body} defaultValue={defaultSelectValue} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                            <Table striped bordered hover className='mb-0 detail-table'>
                                <thead>
                                    <tr>
                                        <th>Tipo Mov.</th>
                                        <th>Importe</th>
                                        <th>Detalle</th>
                                        <th>Fecha</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                {paginatedOperations.length > 0 ? (
                                    <tbody>
                                        {paginatedOperations.map((operation, index) => (
                                            <tr key={index}>
                                                <td>{operation.type.toUpperCase()}</td>
                                                <td className={operation.amount < 0 ? "negative-number mb-0" : "mb-0"}>{operation.amount.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
                                                <td>{operation.holderDataFrom.toUpperCase().replace("- ", "")}</td>
                                                <td>{new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "short" }).format(new Date(operation.operationDate)).replace(/,/g, " -")}</td>
                                                <td>{operation.balance.toLocaleString("es-AR", { style: "currency", currency: account.currency.acronym })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td colSpan={6} className="text-center"><h5 className="h-striped">No se encontraron cuentas</h5></td>
                                        </tr>
                                    </tbody>
                                )}
                            </Table>
                            <div className="box mt-2 text-center mb-1">
                                <Button variant="outline-primary" onClick={handlePreviousPage} disabled={pageNumber === 1} size='sm' className='mr-2'><FaArrowLeft /></Button>
                                <Button variant="outline-primary" onClick={handleNextPage} disabled={pageNumber === Math.ceil(account.operationDataArray.length / itemsPerPage)} size='sm'><FaArrowRight /></Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <hr />
                            <div className='box button-container py-0 d-flex justify-content-between'>
                                <h5 className="h-striped">No existen operaciones en esta cuenta</h5>
                            </div>
                        </>
                    )}
                </CardContainer>
            </div>
        </div>
    );
};

export default CustomerOperations;