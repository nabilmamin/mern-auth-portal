import React, {useState, useContext, useEffect } from 'react';
//useEffect handles side effects. Side Effects are operations that affect other components outside the scope of the function being called. 
//side effects can be data fetching, subrscriptions, or manually changing the DOM.
//we want to trigger a side effect when the component mounts or when the component updates
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; // Yup is a JavaScript schema builder for value parsing and validation
import AuthContext from '../../context/auth/authContext';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { login, isAuthenticated, error, clearErrors } = authContext;
    const [isSubmitting, setIsSubmitting] = useState(false); // useState is a hook that allows you to add state to function components.

    const navigate = useNavigate(); // can call navigate to programmatically navigate to a different route

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
    }, [isAuthenticated, error, clearErrors, navigate]); // dependencies array. if any of these values change, the useEffect will run again.

    // Validation Schema
    const LoginSchema = Yup.object().shape({
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        setIsSubmitting(true);

        try {
            // Login the user
            await login({
                email: values.email, 
                password: values.password
            });
            toast.success('Login successful');
        } catch (err) {
            toast.error('Login failed');
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <Field type="email" name="email" className="form-control" />
                            <ErrorMessage name="email" component="div" className="text-danger" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <Field type="password" name="password" className="form-control" />
                            <ErrorMessage name="password" component="div" className="text-danger" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </Form>
                )}
            </Formik>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;