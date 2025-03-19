import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; // Yup is a JavaScript schema builder for value parsing and validation
import AuthContext from '../../context/auth/authContext';

const ChangePassword = () => {
    const authContext = useContext(AuthContext);
    const { changePassword, error, clearErrors } = authContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearErrors();
        }
    }, [error, clearErrors]);

    // Validation Schema
    const ChangePasswordSchema = Yup.object().shape({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            )
            .required('New password is required'),
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Please confirm your new password')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            await changePassword(values);
            toast.success('Password changed successfully');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Password change failed, please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="change-password-container">
            <h1>Change Password</h1>
            <Formik
                initialValues={{ currentPassword: '', newPassword: '', confirmNewPassword: '' }}
                validationSchema={ChangePasswordSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <Field
                                type="password"
                                name="currentPassword"
                                className="form-control"
                            />
                            <ErrorMessage name="currentPassword" component="div" className="invalid-feedback" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <Field
                                type="password"
                                name="newPassword"
                                className="form-control"
                            />
                            <ErrorMessage name="newPassword" component="div" className="invalid-feedback" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <Field
                                type="password"
                                name="confirmNewPassword"
                                className="form-control"
                            />
                            <ErrorMessage name="confirmNewPassword" component="div" className="invalid-feedback" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Changing...' : 'Change Password'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ChangePassword;