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
        <div className="min-h-screen flex">

            {/* Left panel — product context */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 text-white p-14">

                {/* Brand */}
                <div>
                    <span className="text-xl font-semibold tracking-tight">Client Workspace</span>
                </div>

                {/* Value prop */}
                <div>
                    <h1 className="text-4xl font-semibold leading-snug mb-4">
                        One place for<br />
                        projects, files,<br />
                        and feedback.
                    </h1>
                    <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                        Built for digital agencies and their clients.
                        Replace the scattered emails, Drive links,
                        and WhatsApp threads - for good.
                    </p>
                </div>

                {/* Footer credit */}
                <div>
                    <p className="text-gray-600 text-xs">
                        Developed By - Akansha Rana.
                    </p>
                </div>

            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8">

                <div className="w-full max-w-sm">

                    {/* Mobile brand (hidden on desktop) */}
                    <p className="lg:hidden text-xl font-semibold mb-8">Client Workspace</p>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        Welcome back
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Sign in to your workspace.
                    </p>

                    {/* Inline error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@agency.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                        >
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>

                        <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">

                            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                Workspace Accounts
                            </h3>

                            <div className="space-y-4">

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Agency Admin</p>
                                        <p className="text-xs text-gray-500">
                                            akansha@agency.com
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fillAdmin}
                                        className="text-sm px-3 py-1.5 border rounded-md hover:bg-white"
                                    >
                                        Use
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Client Partner</p>
                                        <p className="text-xs text-gray-500">
                                            sarah@novasmarthome.com
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={fillClient}
                                        className="text-sm px-3 py-1.5 border rounded-md hover:bg-white"
                                    >
                                        Use
                                    </button>
                                </div>

                            </div>

                        </div>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-6">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-gray-900 font-medium hover:underline">
                            Create one
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;