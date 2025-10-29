import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Register.css';

const ClientRegister = () => {
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username is required')
      .min(2, 'Username must be at least 2 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format'),
    contact: Yup.string()
      .required('Contact is required')
      .matches(/^0\d{9}$/, 'Contact must start with 0 and be exactly 10 digits'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await fetch('/api/clients', {
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

      if (response.ok) {
        const data = await response.json();
        alert('Registration successful! Please login.');
        resetForm();
        // You might want to redirect to login page here
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed. Please try again.');
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
        <h2 style={styles.title}>Hey client, signup here</h2>

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
          {({ isSubmitting }) => (
            <Form>
              <div style={styles.formGroup}>
                <label style={styles.label}>username/organization_name</label>
                <Field
                  type="text"
                  name="username"
                  style={styles.input}
                  placeholder="John Doe"
                />
                <ErrorMessage name="username" component="div" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>email</label>
                <Field
                  type="email"
                  name="email"
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                />
                <ErrorMessage name="email" component="div" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>contact</label>
                <Field
                  type="tel"
                  name="contact"
                  style={styles.input}
                  placeholder="0711234355"
                />
                <ErrorMessage name="contact" component="div" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>password</label>
                <Field
                  type="password"
                  name="password"
                  style={styles.input}
                  placeholder="must have at least 8 characters"
                />
                <ErrorMessage name="password" component="div" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  style={styles.input}
                  placeholder="must have at least 8 characters"
                />
                <ErrorMessage name="confirmPassword" component="div" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }} />
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

export default ClientRegister;