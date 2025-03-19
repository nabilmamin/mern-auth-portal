import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; // Yup is a JavaScript schema builder for value parsing and validation
import AuthContext from '../../context/auth/authContext';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register, isAuthenticated, error, clearErrors } = authContext;
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate('/dashboard');
        }

        // Show errors from CONTEXT
        if (error) {
            toast.error(error);
            clearErrors();
        }
    }, [isAuthenticated, error, clearErrors, navigate]);

    // Validation Schema
    const RegisterSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Name is too short')
            .max(50, 'Name is too long')
            .required('Name is required'),
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        phone: Yup.string()
            .matches(/^\d{10}$/, 'Phone number must be 10 digits')
            .required('Phone number is required'),
        password: Yup.string()
            .min(6, 'Password must be atleast 6 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            )
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Please confirm your password')
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setIsSubmitting(true);

        try {
            // Register the user
            const formData ={
                name: values.name,
                email: values.email,
                phone: values.phone,
                password: values.password
            };

            const response = await register(formData);

            // Show success message
            toast.success(response.msg || 'Registration successful! Please check your email to verify your account.');

            // Reset the form
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Registration failed, please try again.');
        } finally {
            // these are form states defined by Formik, an opensource library for building and managing forms in React
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <h1>Sign Up</h1>
            <p>Create your account</p>

            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
                >
                    {({ errors, touched, isSubmitting }) => (
                        <Form>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <Field
                                    type="text"
                                    name="name"
                                    // className is dynamic. If error, then we can adjust the styling of the input field
                                    className={errors.name && touched.name ? 'form-control is-invalid' : 'form-control'}
                                />
                                <ErrorMessage name="name" component="div" className="invalid-feedback" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Field
                                    type="email"
                                    name="email"
                                    className={errors.email && touched.email ? 'form-control is-invalid' : 'form-control'}
                                />
                                <ErrorMessage name="email" component="div" className="invalid-feedback" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <Field
                                    type="text"
                                    name="phone"
                                    className={errors.phone && touched.phone ? 'form-control is-invalid' : 'form-control'}
                                />
                                <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <Field
                                    type="password"
                                    name="password"
                                    className={errors.password && touched.password ? 'form-control is-invalid' : 'form-control'}
                                />
                                <ErrorMessage name="password" component="div" className="invalid-feedback" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <Field
                                    type="password"
                                    name="confirmPassword"
                                    className={errors.confirmPassword && touched.confirmPassword ? 'form-control is-invalid' : 'form-control'}
                                />
                                <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </button>
                        </Form>
                    )}
                </Formik>
            <p className="mt-3">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;