import { Card } from "react-bootstrap";

export default function Section({ children }) {
  return (
    <Card id="CardContainer" className="card-cons-shadow card-cons-br overflow-hidden d-flex flex-column">
      {children}
    </Card>);
}