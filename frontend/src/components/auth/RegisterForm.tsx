import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../styles/Auth.css';

interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export const RegisterForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data);
            toast.success('Registration successful!');
            navigate('/games');
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
                if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        toast.error(err.message);
                    });
                }
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {errors.email && <span className="error">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        {...register('username', {
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                            },
                            maxLength: {
                                value: 30,
                                message: 'Username must be at most 30 characters'
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9_-]+$/,
                                message: 'Username can only contain letters, numbers, underscores, and hyphens'
                            }
                        })}
                    />
                    {errors.username && <span className="error">{errors.username.message}</span>}
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

                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        id="firstName"
                        type="text"
                        {...register('firstName')}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                    />
                </div>

                <button type="submit" className="auth-button">
                    Create Account
                </button>
            </form>
            <div className="auth-links">
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};
