import React, { useState } from 'react';
import { sendOtp } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    try {
      await sendOtp(phone);
      localStorage.setItem('tempPhone', phone);
      navigate('/otp');
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login with Phone</h2>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 shadow-md rounded"
      >
        <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength="10"
          placeholder="Enter phone number"
          className="w-full p-2 mb-3 border border-gray-300 rounded outline-none focus:ring focus:ring-blue-300"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
