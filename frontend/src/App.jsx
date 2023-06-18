import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Main from "./components/Main";
import SideBar from "./components/Sidebar";
import { useCheckCookiesQuery } from './slices/authApiSlice';
import "./styles.scss";

const App = () => {

  if (localStorage.getItem('userInfo')) {
    const [checkCookiesCompleted, setCheckCookiesCompleted] = useState(false);
    const { data, isError } = useCheckCookiesQuery();

    useEffect(() => {
      if (isError && !data) {
        // Ocurrió un error en la solicitud de las cookies
        localStorage.removeItem('userInfo');
        toast.error('Sesion expirada');
        window.location.href = "/login";
      } else {
        setCheckCookiesCompleted(true);
      }
    }, [data, isError]);

    if (!checkCookiesCompleted) {
      return null;
    }
  }

  return (
    <>
      <Layout>
        <SideBar />
        <Main>
          <ToastContainer />
          <Outlet />
        </Main>
      </Layout>
    </>
  );
};

export default App;