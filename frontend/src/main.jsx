import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx';
import Login from './views/Login.jsx';
import Home from './views/customer/Home.jsx';
import Dashboard from './views/bank/Dashboard.jsx';
import Accounts from './views/customer/Accounts.jsx';
import AccountOperations from './views/customer/AccountOperations.jsx';
import AccountSummary from './views/customer/AccountSummary';
import { PrivateRoute, PrivateRouteAdmin, PrivateRouteCustomer, PrivateRouteEmployeeAdmin } from './components/PrivateRoute.jsx';
import UserAccount from './views/customer/UserAccount';
import DepositMoney from './views/bank/Deposit';
import WithdrawMoney from './views/bank/Withdraw';
import TransferMoney from './views/customer/Transfer';
import CustomerAccounts from './views/bank/CustomerAccounts';
import CustomerOperations from './views/bank/CustomerOperations';
import CustomerProfile from './views/bank/CustomerProfile';
import AllCustomersAccounts from './views/bank/Accounts';
import CustomersAccountSummary from './views/bank/AccountSummary';
import CustomerTransferMoney from './views/bank/Transfer';
import UserPanel from './views/bank/UserPanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import UserProfile from './views/bank/UserProfile';
import ProfileUser from './views/ProfileUser';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/login' element={<Login />} />
      <Route path='' element={<PrivateRoute />}>

        <Route path="/customer/home" element={<PrivateRouteCustomer><Home /></PrivateRouteCustomer>} />
        <Route path="/customer/accounts" element={<PrivateRouteCustomer><Accounts /></PrivateRouteCustomer>} />
        <Route path="/customer/accountOperations/:id" element={<PrivateRouteCustomer><AccountOperations /></PrivateRouteCustomer>} />
        <Route path="/customer/userAccount/:id" element={<PrivateRouteCustomer><UserAccount /></PrivateRouteCustomer>} />
        <Route path="/customer/accountSummary" element={<PrivateRouteCustomer><AccountSummary /></PrivateRouteCustomer>} />
        <Route path="/customer/transfer" element={<PrivateRouteCustomer><TransferMoney /></PrivateRouteCustomer>} />

        <Route path="/bank/dashboard" element={<PrivateRouteEmployeeAdmin><Dashboard /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/customerProfile/:id" element={<PrivateRouteEmployeeAdmin><CustomerProfile /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/customerAccounts/:id" element={<PrivateRouteEmployeeAdmin><CustomerAccounts /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/accountOperations/:id" element={<PrivateRouteEmployeeAdmin><CustomerOperations /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/accounts" element={<PrivateRouteEmployeeAdmin><AllCustomersAccounts /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/AccountSummary" element={<PrivateRouteEmployeeAdmin><CustomersAccountSummary /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/deposit" element={<PrivateRouteEmployeeAdmin><DepositMoney /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/withdraw" element={<PrivateRouteEmployeeAdmin><WithdrawMoney /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/transfer" element={<PrivateRouteEmployeeAdmin><CustomerTransferMoney /></PrivateRouteEmployeeAdmin>} />
        <Route path="/bank/userPanel" element={<PrivateRouteAdmin><UserPanel /></PrivateRouteAdmin>} />
        <Route path="/bank/userProfile/:id" element={<PrivateRouteAdmin><UserProfile /></PrivateRouteAdmin>} />

        <Route path="/profile" element={<ProfileUser />} />

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