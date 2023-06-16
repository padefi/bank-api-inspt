import { Container } from 'react-bootstrap';
import { Outlet } from "react-router-dom";
import "./styles.scss";

const App = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;