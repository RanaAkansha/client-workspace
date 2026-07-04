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
        <div className="min-h-screen flex">

            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-950 text-white p-14">
                <div>
                    <span className="text-xl font-semibold tracking-tight">Client Workspace</span>
                </div>

                <div>
                    <h1 className="text-4xl font-semibold leading-snug mb-4">
                        One place for<br />
                        projects, files,<br />
                        and feedback.
                    </h1>
                    <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                        Built for digital agencies and their clients.
                        Replace the scattered emails, Drive links,
                        and WhatsApp threads — for good.
                    </p>
                </div>

                <div>
                    <p className="text-gray-600 text-xs">
                        Designed for modern digital agencies.
                    </p>
                </div>
            </div>

            {/* Right panel — register form */}
            <div className="flex-1 flex items-center justify-center bg-white px-8">

                <div className="w-full max-w-sm">

                    <p className="lg:hidden text-xl font-semibold mb-8">Client Workspace</p>

                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        Create an account
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Get started with your workspace.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Jane Smith"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400"
                            />
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                I am joining as
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white"
                            >
                                <option value="client">Client</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                        >
                            {submitting ? "Creating account..." : "Create account"}
                        </button>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-6">
                        Already have an account?{" "}
                        <Link to="/" className="text-gray-900 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Register;
