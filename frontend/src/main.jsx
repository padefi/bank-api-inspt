import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import Login from './views/Login.jsx';
import Home from './views/client/Home.jsx';
import Dashboard from './views/bank/Dashboard.jsx';
import Accounts from './views/client/Accounts.jsx';
import Profile from './views/client/Profile.jsx';
import AccountOperations from './views/client/AccountOperations.jsx';
import AccountSummary from './views/client/AccountSummary';
import { PrivateRoute, PrivateRouteClient, PrivateRouteEmployeeAdmin } from './components/PrivateRoute.jsx';
import UserAccount from './views/client/UserAccount';
import DepositMoney from './views/bank/Deposit';
import WithdrawMoney from './views/bank/Withdraw';
import TransferMoney from './views/client/Transfer';
import CustomerAccounts from './views/bank/CustomerAccounts';
import CustomerOperations from './views/bank/CustomerOperations';
import CustomerProfile from './views/bank/CustomerProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/login' element={<Login />} />
      <Route path='' element={<PrivateRoute />}>

        <Route path="/client/home" element={<PrivateRouteClient><Home /></PrivateRouteClient>} />
        <Route path="/client/accounts" element={<PrivateRouteClient><Accounts /></PrivateRouteClient>} />
        <Route path="/client/accountOperations/:id" element={<PrivateRouteClient><AccountOperations /></PrivateRouteClient>} />
        <Route path="/client/userAccount/:id" element={<PrivateRouteClient><UserAccount /></PrivateRouteClient>} />
        <Route path="/client/accountSummary" element={<PrivateRouteClient><AccountSummary /></PrivateRouteClient>} />
        <Route path="/client/transfer" element={<PrivateRouteClient><TransferMoney /></PrivateRouteClient>} />
        <Route path="/client/profile" element={<PrivateRouteClient><Profile /></PrivateRouteClient>} />

        <Route path="/bank/dashboard" element={<PrivateRouteEmployeeAdmin><Dashboard /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/customerProfile/:id" element={<PrivateRouteEmployeeAdmin><CustomerProfile /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/customerAccounts/:id" element={<PrivateRouteEmployeeAdmin><CustomerAccounts /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/accountOperations/:id" element={<PrivateRouteEmployeeAdmin><CustomerOperations /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/deposit" element={<PrivateRouteEmployeeAdmin><DepositMoney /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/withdraw" element={<PrivateRouteEmployeeAdmin><WithdrawMoney /></PrivateRouteEmployeeAdmin>} />

        {/* <Route index={true} path='/home' element={<Home />} />
        <Route path='/' element={<Home />} />
        <Route path='/accounts' element={<Accounts />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/accountOperations/:id' element={<AccountOperations />} />
        <Route path='/userAccount/:id' element={<UserAccount />} />
        <Route path='/accountSummary' element={<AccountSummary />} />
        <Route path='/deposit' element={<DepositMoney />} />
        <Route path='/withdraw' element={<WithdrawMoney />} />
        <Route path='/transfer' element={<TransferMoney />} /> */}
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