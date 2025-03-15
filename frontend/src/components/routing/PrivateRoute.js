import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const PrivateRoute = ({ children }) => {
    const authContext = useContext(AuthContext); // useContext is a hook that allows you to use the CONTEXT in a functional component
    const { isAuthenticated, loading, loadUser } = authContext;

    useEffect(() => {
        // Load user data when component mounts if authenticated
        // mounting is when the component is first added to the DOM (Document Object Model)
        if (localStorage.token && !loading && isAuthenticated === null) {
            loadUser();
        }
    }, [loadUser, loading, isAuthenticated]); // dependencies array. if any of these values change, the useEffect will run again.
    // if it were empty [], it would only run once when the component mounts.

    // in context/auth/authContext.js, we've defined the loadUser function. 
    // in context/auth/authReducer.js, we've defined the USER_LOADED action 
    //                                 and to update the state with isAuthenticated = true
    //                                 and to update the state with loading = false
    // loadUser -> USER_LOADED -> isAuthenticated = true && loading = false
    // context -> action -> reducer return new state

    // if loading is true, show loading message
    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }
    // if not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // if authenticated, render the protected component
    return children;
};

export default PrivateRoute; // export the PrivateRoute component to be used in other files