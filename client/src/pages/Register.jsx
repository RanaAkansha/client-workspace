import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layers, MessageSquare, ShieldCheck } from "lucide-react";

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
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">

            {/* Left panel — product context */}
            <div className="lg:w-[35%] w-full bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-8 lg:p-12 flex flex-col justify-between">
                {/* Brand Header */}
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-900 tracking-tight">Client Workspace</span>
                </div>

                {/* Minimal Benefits */}
                <div className="my-12 lg:my-auto space-y-8">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-950 tracking-tight">
                            One portal for your deliverables.
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            A clean and centralized space to share project updates, assets, and revisions.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-white border border-gray-200 rounded-md text-gray-600 shadow-xs">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-gray-900">Project Deliverables</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    View designs, documents, and updates as they are prepared.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-white border border-gray-200 rounded-md text-gray-600 shadow-xs">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-gray-900">Direct Revisions</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Provide clear feedback and comments directly on each deliverable.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-white border border-gray-200 rounded-md text-gray-600 shadow-xs">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-gray-900">Secure Access</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Your private workspaces are secure, scoped, and password-protected.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer credit */}
                <div className="text-xs text-gray-400 font-normal">
                    © {new Date().getFullYear()} Client Workspace.
                </div>
            </div>

            {/* Right panel — register form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16 bg-white">
                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Create an account</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Get started with your collaborative workspace.
                        </p>
                    </div>

                    {/* Inline error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-md mb-5 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Jane Smith"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition duration-150"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@agency.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition duration-150"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition duration-150"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1.5">
                                I am joining as
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm text-gray-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition duration-150 cursor-pointer"
                            >
                                <option value="client">Client Partner</option>
                                <option value="admin">Agency Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-850 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs mt-2"
                        >
                            {submitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-6">
                        Already have an account?{" "}
                        <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

        </div>
    );
}

export default Register;
