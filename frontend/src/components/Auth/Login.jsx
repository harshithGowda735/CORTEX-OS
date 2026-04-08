import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/user/login', data, {
                withCredentials: true
            });
            if (response.data.success) {
                const userData = response.data.data;
                localStorage.setItem('user', JSON.stringify(userData));
                toast.success("Welcome back, " + userData.name);
                
                // Role-based redirection with full state refresh
                if (userData.role === 'hospital') {
                    window.location.href = '/management';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 text-white">
            <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-[#334155] shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">
                        CORTEX-OS
                    </h1>
                    <p className="text-[#94a3b8] mt-2 font-medium">Unified Sign-in</p>
                    <div className="mt-4 flex justify-center gap-2">
                        <span className="px-2 py-1 rounded bg-[#10b981]/10 text-[#10b981] text-[10px] uppercase font-black tracking-widest border border-[#10b981]/20">Patients</span>
                        <span className="px-2 py-1 rounded bg-[#3b82f6]/10 text-[#3b82f6] text-[10px] uppercase font-black tracking-widest border border-[#3b82f6]/20">Hospital Staff</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#94a3b8]">Email Address</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#10b981] transition-colors">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all placeholder:text-[#334155]"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-[#94a3b8]">Password</label>
                            <Link to="/forgot-password" disabled className="text-xs text-[#10b981] hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#10b981] transition-colors">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all placeholder:text-[#334155]"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] py-3 rounded-xl font-semibold transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-[#10b981]/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-[#94a3b8]">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-[#10b981] hover:underline font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
