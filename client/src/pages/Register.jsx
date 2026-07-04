import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/useAuth";

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "client",
    });
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
            // Register the account
            await api.post("/auth/register", formData);

            // Then immediately log them in
            const loginRes = await api.post("/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            login(loginRes.data.user, loginRes.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">

            {/* Left panel */}
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

                {/* Value prop */}
                <div className="relative z-10 my-auto space-y-6">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200">
                        Join the workspace<br />
                        and align on results.
                    </h1>
                    <p className="text-slate-300 text-base leading-relaxed max-w-md">
                        Collaborate transparently, view project deliverables in real time, and share contextual revisions without the communication noise.
                    </p>
                </div>

                {/* Footer credit */}
                <div className="relative z-10">
                    <p className="text-slate-500 text-xs font-medium">
                        Designed for modern digital agencies.
                    </p>
                </div>
            </div>

            {/* Right panel — register form */}
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
                        Create an account
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 font-medium">
                        Get started with your collaborative workspace.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Jane Smith"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

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

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                I am joining as
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-white rounded-lg px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value="client">Client Partner</option>
                                <option value="admin">Agency Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed mt-4 cursor-pointer"
                        >
                            {submitting ? "Creating account..." : "Create account"}
                        </button>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-8">
                        Already have an account?{" "}
                        <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Register;
