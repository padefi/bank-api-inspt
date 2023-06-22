import { Container, Row, Col } from 'react-bootstrap';

const FormContainer = ({ children }) => {
  return (
    <Container>
      <Row className='justify-content-md-center mt-4'>
        <Col className='card p-4 pt-2 pb-2'>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;