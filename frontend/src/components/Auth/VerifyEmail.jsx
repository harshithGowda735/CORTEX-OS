import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) {
            toast.error("Please enter the full code");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http'}://localhost:5000/api/user/verify-email`, {
                email,
                code
            });
            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http'}://localhost:5000/api/user/resend-otp`, { email });
            if (response.data.success) {
                toast.success("Verification code resent");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend code");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 text-white">
            <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-[#334155] shadow-2xl">
                <button 
                    onClick={() => navigate('/register')}
                    className="mb-8 text-[#94a3b8] hover:text-white flex items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Register
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#10b981]">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    <p className="text-[#94a3b8] mt-2">
                        We've sent a 6-digit code to <br/>
                        <span className="text-[#e2e8f0] font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 bg-[#0f172a] border border-[#334155] rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#10b981] hover:bg-[#059669] py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-[#94a3b8]">
                        Didn't receive the code?{" "}
                        <button 
                            onClick={handleResend}
                            disabled={resending}
                            className="text-[#10b981] hover:underline font-medium disabled:opacity-50"
                        >
                            {resending ? "Resending..." : "Resend Code"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
