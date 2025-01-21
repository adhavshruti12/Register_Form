import React, { useState, useEffect } from 'react';
import axios from 'axios';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');

  const navigate = useNavigate();

  const backendURL =
    process.env.NODE_ENV === 'production'
      ? 'https://register-form-api-plum.vercel.app/api'
      : 'http://localhost:5000/api';

  // Debug API reachability
  useEffect(() => {
    axios
      .get(`${backendURL}/ping`)
      .then(() => console.log('API is reachable'))
      .catch(() => console.error('API is not reachable'));
  }, [backendURL]);

  const checkPasswordStrength = (password) => {
    let strengthMessage = '';
    let isValid = true;

    if (password.length < 6) {
      strengthMessage = 'Password should be at least 6 characters long';
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strengthMessage = 'Password should include at least one special character';
      isValid = false;
    } else {
      strengthMessage = 'Password is strong';
    }

    setPasswordStrength(strengthMessage);
    return isValid;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
    setPasswordMatch(newPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(password === newConfirmPassword);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!validator.isEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength !== 'Password is strong') {
      setError('Please ensure your password meets the strength requirements');
      return;
    }

    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('image', image);

      // Debugging: Log FormData content
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`${backendURL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage(response.data.message);
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setImage(null);
      navigate('/login');
    } catch (err) {
      console.error('Error:', err.response || err.message || err);
      setError(err.response?.data?.message || 'An error occurred');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <div className="password-strength">
          <small>{passwordStrength}</small>
        </div>

        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />
        <div
          className={`password-match ${
            passwordMatch ? 'correct' : 'incorrect'
          }`}
        >
          {passwordMatch === false && <small>Passwords do not match</small>}
          {passwordMatch === true && <small>Passwords match</small>}
        </div>

        <label>Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default RegistrationForm;
