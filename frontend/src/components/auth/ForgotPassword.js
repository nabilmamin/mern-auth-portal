import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/auth/authContext';

const ForgotPassword = () => {
  const authContext = useContext(AuthContext);
  const { forgotPassword, error, clearErrors } = authContext;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validation schema
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    
    try {
      // Request password reset
      const response = await forgotPassword(values.email);
      
      // Show success message
      toast.success(response.msg || 'Password reset email sent!');
      
      // Update UI state
      setEmailSent(true);
      
      // Reset form
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send password reset email. Please try again.');
      
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
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>
      
      {emailSent ? (
        <div className="email-sent-message">
          <div className="alert alert-success" role="alert">
            We've sent a password reset link to your email. Please check your inbox.
          </div>
          
          <p>
            Didn't receive the email? Check your spam folder or{' '} {/* added space between words */}
            <button 
              className="btn btn-link p-0"
              onClick={() => setEmailSent(false)} 
              // sets the emailSent state back to false. 
              // the form will also change to show the false emailSent state version 
              // where the user can enter their info again.
            >
              try again
            </button>.
          </p>
          
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      ) : (
        <>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          
          <Formik
            initialValues={{
              email: ''
            }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className={errors.email && touched.email ? 'form-control is-invalid' : 'form-control'}
                  />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;