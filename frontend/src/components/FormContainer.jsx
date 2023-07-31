import { Container, Row, Col, Card } from 'react-bootstrap';

const FormContainer = ({ children }) => {
  return (
    <Container className='container-login' fluid="xxl">
      <Card>
        <Row className="g-0">
          {children}
        </Row>
      </Card>
    </Container>
  );
};

export default FormContainer;