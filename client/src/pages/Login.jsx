import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/useAuth";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const fillAdmin = () => {
        setFormData({
            email: "akansha@agency.com",
            password: "admin123",
        });
    };

    const fillClient = () => {
        setFormData({
            email: "sarah@novasmarthome.com",
            password: "client123",
        });
    };
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const response = await api.post("/auth/login", formData);
            login(response.data.user, response.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">

            {/* Left panel — product context */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white p-16 relative overflow-hidden">
                {/* Geometric Grid Background */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                </div>
                {/* Glow Spheres */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg">
                        C
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Client Workspace</span>
                </div>

                {/* Feature preview visualizer */}
                <div className="relative z-10 my-auto space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200">
                            A centralized hub for client collaboration.
                        </h1>
                        <p className="text-slate-300 text-base leading-relaxed max-w-md">
                            Ditch the scattered email threads, messaging groups, and lost links. One workspace for your projects, files, and direct feedback.
                        </p>
                    </div>

                    {/* Live visualization of portal cards */}
                    <div className="space-y-4 max-w-sm">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                PJ
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Corporate Website Redesign</p>
                                <p className="text-xs text-indigo-300 font-medium">Apex Creative Agency — Active</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-xl flex items-center gap-4 translate-x-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                DL
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Homepage Mockup.fig</p>
                                <p className="text-xs text-purple-300 font-medium">Delivered to Sarah Jenkins</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-xl flex items-center gap-4 translate-x-8">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                CM
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">"Check out states look great!"</p>
                                <p className="text-xs text-emerald-300 font-medium">New Client Message</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer credit */}
                <div className="relative z-10">
                    <p className="text-slate-500 text-xs font-medium">
                        Designed for modern digital agencies.
                    </p>
                </div>

            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12">

                <div className="w-full max-w-sm">

                    {/* Mobile brand (hidden on desktop) */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            C
                        </div>
                        <span className="text-lg font-bold tracking-tight text-gray-900">Client Workspace</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 font-medium">
                        Sign in to access your dashboard.
                    </p>

                    {/* Inline error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@agency.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-indigo-750 active:bg-indigo-850 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed mt-4 cursor-pointer"
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>

                        <div className="mt-8 border border-indigo-100 rounded-xl p-4 bg-indigo-50/40">

                            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                Demo Reviewer Accounts
                            </h3>

                            <div className="space-y-3.5">

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Agency Admin</p>
                                        <p className="text-[11px] text-gray-500">
                                            akansha@agency.com
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fillAdmin}
                                        className="text-xs px-2.5 py-1.5 border border-indigo-200/60 rounded-md bg-white hover:bg-indigo-50 text-indigo-650 font-medium transition cursor-pointer"
                                    >
                                        Use
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">Client Partner</p>
                                        <p className="text-[11px] text-gray-500">
                                            sarah@novasmarthome.com
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fillClient}
                                        className="text-xs px-2.5 py-1.5 border border-indigo-200/60 rounded-md bg-white hover:bg-indigo-50 text-indigo-650 font-medium transition cursor-pointer"
                                    >
                                        Use
                                    </button>
                                </div>

                            </div>

                        </div>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-8">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-indigo-650 font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;