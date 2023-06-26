import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import Login from './views/Login.jsx';
import Home from './views/Home.jsx';
import Accounts from './views/Accounts.jsx';
import Profile from './views/Profile.jsx';
import AccountOperations from './views/AccountOperations.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/login' element={<Login />} />
      <Route path='' element={<PrivateRoute />}>
        <Route index={true} path='/home' element={<Home />} />
        <Route path='/accounts' element={<Accounts />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/accountOperations/:id' element={<AccountOperations />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>{/* SE DEBE ELIMINAR EN PRODUCCION YA QUE DUPLICA EL RENDERIZADO */}
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);