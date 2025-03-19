import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/auth/authContext';

const UpdateProfile = () => {
    const authContext = useContext(AuthContext);
    const { user, loading, loadUser, updateProfile, error, clearErrors } = authContext;
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUser();
        if (error) {
            toast.error(error);
            clearErrors();
        }
    }, [error, loadUser, clearErrors]);

    const ProfileSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Name must be at least 2 characters')
            .required('Name is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        setIsSubmitting(true);

        try {
            const response = await updateProfile({
                name: values.name,
                email: values.email
            });

            toast.success(response.msg || 'Profile updated successfully!');

            if (response.msg && response.msg.includes('verify your new email')) {
                toast.info('Please check your email to verify your new address.');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="profile-container">
            <h1>Your Profile</h1>
            {loading ? (
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading user data...</span>
                </div>
            ) : (
                <>
                    <p>Update your account information below.</p>

                    <Formik
                        initialValues={{
                            name: user ? user.name : '',
                            email: user ? user.email : ''
                        }}
                        enableReinitialize={true}
                        validationSchema={ProfileSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <Field
                                        type="text"
                                        name="name"
                                        id="name"
                                        className={errors.name && touched.name ? 'form-control is-invalid' : 'form-control'}
                                        aria-label="Name"
                                    />
                                    <ErrorMessage name="name" component="div" className="invalid-feedback" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        id="email"
                                        className={errors.email && touched.email ? 'form-control is-invalid' : 'form-control'}
                                        aria-label="Email"
                                    />
                                    <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                    {user && user.email !== values.email && (
                                        <small className="form-text text-muted">
                                            Changing your email will require verification of the new address.
                                        </small>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : 'Update Profile'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-4">
                        <h3>Account Status</h3>
                        <p>
                            <strong>Email Verification:</strong>{' '}
                            {user && user.isVerified ? (
                                <span className="text-success">Verified</span>
                            ) : (
                                <span className="text-danger">
                                    Not Verified - Please check your email for verification link
                                </span>
                            )}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default UpdateProfile;