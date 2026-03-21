import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import { ShopProvider } from './context/ShopContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from "sileo";

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <ShopProvider>
        <Toaster position="bottom-center" >
        <App />
        </Toaster>
      </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
