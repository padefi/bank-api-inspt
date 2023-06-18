import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Main from "./components/Main";
import SideBar from "./components/Sidebar";
import { useCheckCookiesQuery } from './slices/authApiSlice';
import "./styles.scss";

const App = () => {

  const [checkCookiesCompleted, setCheckCookiesCompleted] = useState(false);
  const { data, isError, isSuccess } = useCheckCookiesQuery();

  useEffect(() => {
    if (isError && isSuccess) {
      // Ocurrió un error en la solicitud de las cookies
      localStorage.removeItem('userInfo');
    } else if (isError && !isSuccess) {
      // Las cookies expirarion
      localStorage.removeItem('userInfo');
    } else {
      setCheckCookiesCompleted(true);
    }
  }, [data, isError]);

  if (!checkCookiesCompleted) {
    return null;
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