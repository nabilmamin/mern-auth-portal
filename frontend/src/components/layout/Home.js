import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Home = () => {
    // Access the authentication context
    const authContext = useContext(AuthContext);
    const { isAuthenticated } = authContext;

    return (
        <div className="home-container">
            <div className="landing">
                <div className="dark-overlay">
                    <div className="landing-inner">
                        <h1>Welcome to Auth Portal</h1>
                        <p className="lead">
                            A secure authentication system with email verification and password reset functionality.
                        </p>
                        <div className="buttons">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/register" className="btn btn-primary">
                                        Register
                                    </Link>
                                    <Link to="/login" className="btn btn-light">
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link to="/dashboard" className="btn btn-primary">
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;