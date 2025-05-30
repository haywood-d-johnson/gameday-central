import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../styles/Auth.css';

interface LoginFormData {
    emailOrUsername: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.emailOrUsername, data.password);
            toast.success('Successfully logged in!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Invalid username/email or password');
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Welcome to Game Day Central</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                    <label htmlFor="emailOrUsername">Email or Username</label>
                    <input
                        id="emailOrUsername"
                        type="text"
                        {...register('emailOrUsername', {
                            required: 'Email or username is required'
                        })}
                    />
                    {errors.emailOrUsername && <span className="error">{errors.emailOrUsername.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            }
                        })}
                    />
                    {errors.password && <span className="error">{errors.password.message}</span>}
                </div>

                <button type="submit" className="auth-button">
                    Login
                </button>
            </form>
            <div className="auth-links">
                <p>Don't have an account? <Link to="/register">Create an account</Link></p>
            </div>
        </div>
    );
};
