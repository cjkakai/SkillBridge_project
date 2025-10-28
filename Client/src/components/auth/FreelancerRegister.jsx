import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Register.css';

const FreelancerRegister = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email address')
      .matches(/@/, 'Email must contain @')
      .required('Email is required'),
    contact: Yup.string()
      .matches(/^0\d{9}$/, 'Contact must start with 0 and be exactly 10 digits')
      .required('Contact is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('/api/freelancers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.username,
          email: values.email,
          contact: values.contact,
          password: values.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, redirect to login
        navigate('/');
      } else {
        // Handle errors
        if (data.error) {
          setErrors({ general: data.error });
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px'
    },
    card: {
      backgroundColor: '#f0f8ff',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '450px',
      height: '745px'
    },
    title: {
      fontSize: '20px',
      marginBottom: '30px',
      color: '#ffb366',
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '5px',
      color: '#333',
      textAlign: 'left'
    },
    description: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '5px'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    fileInput: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      boxSizing: 'border-box'
    },
    error: {
      fontSize: '12px',
      color: '#dc3545',
      marginTop: '5px'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px'
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '14px',
      color: '#666'
    },
    link: {
      color: '#007bff',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Hey freelancer, signup here</h2>

        <Formik
          initialValues={{
            username: '',
            email: '',
            contact: '',
            password: '',
            confirmPassword: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              {errors.general && (
                <div style={{ ...styles.error, marginBottom: '20px', textAlign: 'center' }}>
                  {errors.general}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>username</label>
                <Field
                  type="text"
                  name="username"
                  style={styles.input}
                  placeholder="John Doe"
                />
                <ErrorMessage name="username" component="div" style={styles.error} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>email</label>
                <Field
                  type="email"
                  name="email"
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                />
                <ErrorMessage name="email" component="div" style={styles.error} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>contact</label>
                <Field
                  type="tel"
                  name="contact"
                  style={styles.input}
                  placeholder="0711234355"
                />
                <ErrorMessage name="contact" component="div" style={styles.error} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>password</label>
                <Field
                  type="password"
                  name="password"
                  style={styles.input}
                  placeholder="must have at least 8 characters"
                />
                <ErrorMessage name="password" component="div" style={styles.error} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  style={styles.input}
                  placeholder="must have at least 8 characters"
                />
                <ErrorMessage name="confirmPassword" component="div" style={styles.error} />
              </div>

              <button type="submit" style={styles.button} disabled={isSubmitting}>
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>

        <div style={styles.loginLink}>
          Already signed up? <Link to="/" style={styles.link}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default FreelancerRegister;
