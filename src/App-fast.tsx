import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderStatus from './components/orders/OrderStatus';
import SellerDashboard from './components/dashboard/SellerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentPage from './components/checkout/PaymentPage';
import CheckoutSuccess from './components/checkout/CheckoutSuccess';
import CheckoutFailure from './components/checkout/CheckoutFailure';

console.log('🚀 App-fast cargando...');

function App() {
  return (
    <div style={{padding: '20px', background: 'lightgreen'}}>
      <h1>🚀 APP SUPER SIMPLE - SIN CONTEXTOS</h1>
      <p>Si ves esto, el problema está en los contextos</p>
      <div>
        <a href="/login" style={{color: 'blue', marginRight: '20px'}}>Login</a>
        <a href="/productos" style={{color: 'blue', marginRight: '20px'}}>Productos</a>
        <a href="/" style={{color: 'blue'}}>Inicio</a>
      </div>
    </div>
  );
}

export default App;
