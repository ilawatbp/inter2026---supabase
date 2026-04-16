import Home from './pages/Home'
import ItemsPage from './pages/ItemsPage';
import CartPage from './components/cart/CartPage'
import PrestigePage from './pages/PretigePage';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import UpdatePassword from './pages/UpdatePassword';

import { Routes, Route } from "react-router-dom";

import UserOnlyRoute from './routes/UserOnlyRoute';
import AdminOnlyRoute from './routes/AdminOnlyRoute';
import RoleHomeRedirect from './routes/RoleHomeRedirect';

import { useEffect } from 'react';

function App() {

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isPrintShortcut =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p";

      if (isPrintShortcut) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  return (
    <div className='bg-[#f8f8f8] min-h-screen'>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/" element={<RoleHomeRedirect />} />

        <Route element={<UserOnlyRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/query" element={<ItemsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/prestige" element={<PrestigePage />} />
        </Route>

        <Route element={<AdminOnlyRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;