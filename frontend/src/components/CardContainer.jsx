import { Card } from "react-bootstrap";

export default function CardContainer({ id, children }) {
  return (
    <Card id={id} className="card-cons-shadow card-cons-br overflow-hidden d-flex flex-column rounded-4">
      {children}
    </Card>);
}