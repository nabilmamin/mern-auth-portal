import React, { createContext, useReducer, useEffect } from 'react';

// axios is a promise based HTTP client for the browser and node.js
// it is used to make HTTP requests to the backend API
import axios from 'axios';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';

// Create context
const AuthContext = createContext();

// Create provider component
// The AuthProvider component will wrap the entire app and provide the authentication state and functions to the rest of the app
// The children prop will be the components that are wrapped by the AuthProvider

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  // The AuthProvider component will use the useReducer hook to manage the authentication state
  // The AuthContext.Provider component will provide the authentication state and functions to the rest of the app
  // The AuthContext.Consumer component will be used to consume the authentication state and functions in the components that need them
  // The AuthContext will be used to provide the authentication state and functions to the rest of the app
  // The AuthContext will be used to consume the authentication state and functions in the components that need them
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    // Check for token in local storage (client side browser storage)
    if (localStorage.token) {
      // Set authorization header for AXIOS requests. 
      setAuthToken(localStorage.token);
    }

    try {
      // Make a GET request to the /api/auth/me endpoint to get the user data using the authorization token
      // The /api/auth/me endpoint is a protected route that requires authentication
      const res = await axios.get('/api/auth/me');

      // Dispatch the USER_LOADED action to update the state with the user data
      // The USER_LOADED action is defined in the authReducer
      dispatch({
        type: 'USER_LOADED',
        // The payload is the user data returned from the API
        // the reducer will update the state with the user data
        payload: res.data.user
      });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register User
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/auth/register', formData, config);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response.data.msg || 'Registration failed'
      });
      throw err;
    }
  };

  // Verify Email
  const verifyEmail = async (token) => {
    try {
      const res = await axios.get(`/api/auth/verify-email/${token}`);

      dispatch({
        type: 'VERIFY_EMAIL_SUCCESS',
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: 'VERIFY_EMAIL_FAIL',
        payload: err.response.data.msg || 'Email verification failed'
      });
      throw err;
    }
  };

  // Login User
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/auth/login', formData, config);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      loadUser();
      return res.data;
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response.data.msg || 'Login failed'
      });
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout error:', err);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  // Forgot Password
  const forgotPassword = async (email) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/auth/forgot-password', { email }, config);
      return res.data;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response.data.msg || 'Failed to send password reset email'
      });
      throw err;
    }
  };

  // Reset Password
  const resetPassword = async (token, password) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put(`/api/auth/reset-password/${token}`, { password }, config);
      return res.data;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response.data.msg || 'Failed to reset password'
      });
      throw err;
    }
  };

  // Update Profile
  const updateProfile = async (userData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put('/api/users/profile', userData, config);
      
      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: res.data
      });
      
      return res.data;
    } catch (err) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: err.response.data.msg || 'Failed to update profile'
      });
      throw err;
    }
  };

  // Set up axios defaults
  useEffect(() => {
    // Set base URL for axios
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true; // Allows cookies to be sent with requests
    
    // Load user on initial render if token exists
    if (localStorage.token) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        verifyEmail,
        login,
        logout,
        loadUser,
        clearErrors,
        forgotPassword,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;