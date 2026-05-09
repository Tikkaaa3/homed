import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface CreateForm {
  name: string;
}

interface JoinForm {
  joinCode: string;
}

const Onboarding = () => {
  const { register: rc, handleSubmit: hc, formState: { errors: ec } } = useForm<CreateForm>();
  const { register: rj, handleSubmit: hj, formState: { errors: ej } } = useForm<JoinForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  const refreshUser = async () => {
    const token = localStorage.getItem('homed_token');
    if (!token) return;
    const res = await client.get('/auth/me');
    login(token, res.data);
    navigate('/');
  };

  const onCreate = async (data: CreateForm) => {
    try {
      setCreateError('');
      await client.post('/houses', data);
      await refreshUser();
    } catch {
      setCreateError('Failed to create house. Please try again.');
    }
  };

  const onJoin = async (data: JoinForm) => {
    try {
      setJoinError('');
      await client.post('/houses/join', data);
      await refreshUser();
    } catch {
      setJoinError('Invalid join code. Please check and try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-2xl font-medium mb-8">Welcome! Let's get you set up.</h1>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-4">Create a New House</h2>
          <form onSubmit={hc(onCreate)} className="space-y-4">
            <div>
              <input
                placeholder="House Name"
                {...rc('name', { required: 'House name is required' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {ec.name && <p className="text-sm text-red-500 mt-1">{ec.name.message}</p>}
            </div>
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Create House
            </button>
          </form>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-medium mb-4">Join Existing House</h2>
          <form onSubmit={hj(onJoin)} className="space-y-4">
            <div>
              <input
                placeholder="Join Code"
                {...rj('joinCode', { required: 'Join code is required' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {ej.joinCode && <p className="text-sm text-red-500 mt-1">{ej.joinCode.message}</p>}
            </div>
            {joinError && <p className="text-sm text-red-500">{joinError}</p>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Join House
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
