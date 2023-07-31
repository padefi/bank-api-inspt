import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Main from "./components/Main";
import SideBar from "./components/Sidebar";
import "./styles.scss";

const App = () => {

  return (
    <Layout>
      <SideBar />
      <Main>
        <ToastContainer />
        <Outlet />
      </Main>
    </Layout>
  );
};

export default App;