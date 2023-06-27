import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Main from "./components/Main";
import SideBar from "./components/Sidebar";
import { useCheckCookiesQuery } from './slices/authApiSlice';
import "./styles.scss";
import { useDispatch } from "react-redux";
import { userMessage } from "./slices/authSlice";

const App = () => {

  if (localStorage.getItem('userInfo')) {
    const [checkCookiesCompleted, setCheckCookiesCompleted] = useState(false);
    const { data, isError } = useCheckCookiesQuery({ id: '' }, { refetchOnMountOrArgChange: true });
    const dispatch = useDispatch();

    useEffect(() => {
      if (isError && !data) {
        // Ocurrió un error en la solicitud de las cookies
        localStorage.removeItem('userInfo');
        dispatch(userMessage('exp'));
        window.location.href = '/login';
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