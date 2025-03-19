// src/components/auth/ResetPassword.js
import React, { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/auth/authContext';

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  // useParams is a hook that returns an object of key/value pairs of URL parameters
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { resetPassword, error, clearErrors } = authContext;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validation schema
  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    
    try {
      // Reset password
      const response = await resetPassword(token, values.password);
      
      // Show success message
      toast.success(response.msg || 'Password reset successful!');
      
      // Update UI state
      setResetSuccess(true);
      
      // Reset form
      resetForm();
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password. Please try again.');
      
      // Clear context errors
      if (error) {
        clearErrors();
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h1>Reset Password</h1>
      
      {resetSuccess ? (
        <div className="reset-success-message">
          <div className="alert alert-success" role="alert">
            Your password has been reset successfully.
          </div>
          
          <p>You will be redirected to the login page shortly...</p>
          
          <p>
            <Link to="/login">Go to Login</Link>
          </p>
        </div>
      ) : (
        <>
          <p>Enter your new password below.</p>
          
          <Formik
            initialValues={{
              password: '',
              confirmPassword: ''
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className={errors.password && touched.password ? 'form-control is-invalid' : 'form-control'}
                  />
                  <ErrorMessage name="password" component="div" className="invalid-feedback" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={errors.confirmPassword && touched.confirmPassword ? 'form-control is-invalid' : 'form-control'}
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </Form>
            )}
          </Formik>
          
          <p className="mt-3">
            <Link to="/login">Back to Login</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default ResetPassword;