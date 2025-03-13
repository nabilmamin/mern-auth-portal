import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Auth Components
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Layout Components
import Navbar from './components/layout/Navbar';
import Home from './components/layout/Home';
import NotFound from './components/layout/NotFound';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/dashboard/Profile';

// Private Route
import PrivateRoute from './components/routing/PrivateRoute'; // A private route is a route that requires authentication to access it

// Update User Components
import UpdateProfile from './components/user/UpdateProfile';
import ChangePassword from './components/user/ChangePassword';

// Auth Context
import { AuthProvider } from './context/auth/authContext';

const App = () => {
  return (
    // Wrap the entire app in the AuthProvider, allows you to share and manage the authentication state such as current user
    // authentication tokens, and auhtentication related functions throughout the app */}
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:Token" element={<ResetPassword />} />
              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
              <Route path="/profile" element={<PrivateRoute component={Profile} />} />
              <Route path="/update-profile" element={<PrivateRoute component={UpdateProfile} />} />
              <Route path="/change-password" element={<PrivateRoute component={ChangePassword} />} />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>         
          </div>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;