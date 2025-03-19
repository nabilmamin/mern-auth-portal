import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, loading, loadUser, error } = authContext;

  useEffect(() => {
    loadUser();
  }, [loadUser]); // Added loadUser to the dependency array

  if (error) {
    return <div className="error-message">Failed to load user data. Please try again later.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      {loading ? (
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <>
          <div className="welcome-message">
            <h2>Welcome {user && user.name}</h2>
            <p>You are now authenticated and can access protected resources.</p>
          </div>

          <div className="dashboard-cards">
            {/* User Information Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">User Information</h5>
                <p className="card-text">
                  <strong>Name:</strong> {user && user.name}
                </p>
                <p className="card-text">
                  <strong>Email:</strong> {user && user.email}
                </p>
                <p className="card-text">
                  <strong>Account Status:</strong>{' '}
                  {user && user.isVerified ? (
                    <span className="text-success">Verified</span>
                  ) : (
                    <span className="text-danger">Not Verified</span>
                  )}
                </p>
                <Link to="/profile" className="btn btn-primary" aria-label="Edit Profile">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Account Security Card */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Account Security</h5>
                <p className="card-text">
                  Keep your account secure by regularly updating your password and verifying your contact information.
                </p>
                <Link to="/change-password" className="btn btn-secondary" aria-label="Change Password">
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;