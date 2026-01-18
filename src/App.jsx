import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages - Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Customer
import ShopList from './pages/customer/ShopList';
import ShopDetail from './pages/customer/ShopDetail';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Pages - Shop
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopPricing from './pages/shop/ShopPricing';
import ShopOrders from './pages/shop/ShopOrders';
import ShopOrderDetail from './pages/shop/ShopOrderDetail';
import ShopAnalytics from './pages/shop/ShopAnalytics';

const Home = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Print Documents Anywhere</h1>
    <p className="text-xl text-gray-600 mb-8">Connect with local print shops and get your documents printed hassle-free.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route path="/shops" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ShopList />
              </ProtectedRoute>
            }
            />
            <Route path="/shop/:shopId" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ShopDetail />
              </ProtectedRoute>
            }
            />
            <Route path="/checkout/:orderId" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            }
            />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MyOrders />
              </ProtectedRoute>
            }
            />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Profile />
              </ProtectedRoute>
            }
            />

            {/* Shop Routes */}
            <Route path="/shop/dashboard" element={
              <ProtectedRoute allowedRoles={['shop']}>
                <ShopDashboard />
              </ProtectedRoute>
            }
            />
            <Route path="/shop/pricing" element={
              <ProtectedRoute allowedRoles={['shop']}>
                <ShopPricing />
              </ProtectedRoute>
            }
            />
            <Route path="/shop/orders" element={
              <ProtectedRoute allowedRoles={['shop']}>
                <ShopOrders />
              </ProtectedRoute>
            }
            />
            <Route path="/shop/order/:orderId" element={
              <ProtectedRoute allowedRoles={['shop']}>
                <ShopOrderDetail />
              </ProtectedRoute>
            }
            />
            <Route path="/shop/analytics" element={
              <ProtectedRoute allowedRoles={['shop']}>
                <ShopAnalytics />
              </ProtectedRoute>
            }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
