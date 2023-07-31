import { Col, Row } from "react-bootstrap";

export default function BoxContainer({ children }) {
    return (
        <div className='box fixed-content' id='box-container'>
            <Row className="d-flex justify-content-center align-items-center">
                <Col xs={12} sm={12} md={7} lg={7} xl={7} xxl={7}>
                    {children}
                </Col>
            </Row>
        </div>
    );
}