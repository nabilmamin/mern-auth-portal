import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../../context/auth/authContext';

const VerifyEmail = () => {
    const { token } = useParams(); // useParams is a hook that returns an object of key/value pairs of URL parameters
    const authContext = useContext(AuthContext);
    const { verifyEmail, error, clearErrors } = authContext;


    const [verifying, setVerifying] = useState(true); // verifying is now a state, and its initial state is True
    const [verified, setVerified] = useState(false); // verified is now a defined state, and its initial state is False
    const [message, setMessage] = useState('Verifying your email...'); // message state is initialized with a value of 'Verifying your email...'

    useEffect(() => {  // this useEffect will run the verify() function when the component mounts. 
        const verify = async () => {
            try {
                if (token) {
                    const response = await verifyEmail(token);
                    setVerified(true); // verified status is updated to true.
                    setMessage(response.message || 'Your email has been verified successfully!');
                } else {
                    setMessage('Invalid verification link.');  // verified status remains false.
                }
            } catch (err) {
                setMessage(err.response.data.msg || 'Email verification failed. Please try again.'); // verified remains false.
            } finally {
                setVerifying(false); // verifying = false, verified = true.
            }
        };

        verify(); // Call the verify function

        // Show errors from CONTEXT
        if (error) {
            toast.error(error);
            clearErrors();
        }
    }, [token, verifyEmail, error, clearErrors]); // useEffect will run when any of these change. 

    return (
        <div className="verify-email-container text-center">
            <h1>Email Verification</h1>
            {verifying ? (  
                // if verifying is true, show loading spinner
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            ) : (
                // if verifying is false &&
                <>
                {/* verified is true, class is alert-success. if false, class is alert-danger */}
                <div className={`alert ${verified ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                </div>
                {/* if verified is true, show login button. if false, show register button */}
                {verified ? (
                    <Link to="/login" className="btn btn-primary">Login to Your Account</Link>
                ) : (
                    <Link to="/register" className="btn btn-primary">Register Again</Link>
                )}
                </>
            )}
        </div>
    );
}

export default VerifyEmail;