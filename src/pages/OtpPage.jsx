import React, { useState } from 'react';
import { verifyOtp } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = localStorage.getItem('tempPhone');
    if (!otp) return setError('Enter OTP');

    try {
      console.log(`Verifying OTP for phone: ${phone} with OTP: ${otp}`);
      
      const res = await verifyOtp(phone, otp);
      console.log(res)
      const {data}=res
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid response from server');
      }
      else{
      login(data);
      console.log('OTP verified successfully:', data);
      navigate('/');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('Invalid OTP');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
      <form onSubmit={handleSubmit} className="w-80 p-4 bg-white shadow-md rounded">
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 mb-4 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OtpPage;
