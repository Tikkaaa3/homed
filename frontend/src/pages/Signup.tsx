import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface SignupForm {
  email: string;
  password: string;
  displayName: string;
}

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: SignupForm) => {
    try {
      setServerError('');
      const res = await client.post('/auth/signup', data);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch {
      setServerError('Signup failed. Email may already be in use.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-medium text-center">Sign Up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              placeholder="Display Name"
              {...register('displayName', { required: 'Display name is required' })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.displayName && <p className="text-sm text-red-500 mt-1">{errors.displayName.message}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
