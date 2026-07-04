import { useCallback, useEffect, useState } from "react";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { StatusBadge, ErrorBanner } from "../component/shared";
import { Trash2 } from "lucide-react";

function Projects() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "Planning",
        client_id: "",
    });

    const fetchProjects = useCallback(async () => {
        try {
            const res = await api.get("/projects");
            setProjects(res.data.projects);
        } catch (err) {
            setError("Failed to load projects.");
            console.error(err);
        }
    }, []);

    const fetchClients = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await api.get("/users/clients");
            setClients(res.data.clients);
        } catch (err) {
            console.error(err);
        }
    }, [isAdmin]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchProjects(), fetchClients()]);
            setLoading(false);
        };
        loadData();
    }, [fetchProjects, fetchClients]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.client_id) {
            setError("Project title and client are required.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await api.post("/projects", formData);
            setFormData({ title: "", description: "", status: "Planning", client_id: "" });
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create project.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This will delete all comments and deliverables linked to it.`)) {
            return;
        }
        try {
            await api.delete(`/projects/${id}`);
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete project.");
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                            ? "Create and manage projects for your clients."
                            : "Projects your agency is working on for you."}
                    </p>
                </div>

                <ErrorBanner message={error} />

                {/* Create form — admin only */}
                {isAdmin && clients.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-5">Create Project</h2>

                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Website Redesign"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Brief description of the project scope..."
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Client <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="client_id"
                                        value={formData.client_id}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="">Select client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Creating..." : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Projects table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">
                            {isAdmin ? "All Projects" : "Your Projects"}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-400">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No active projects found.</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isAdmin 
                                    ? "Get started by adding a new project using the form above." 
                                    : "Please contact Apex Creative Agency to assign a project to your account."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                                    )}
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{project.title}</p>
                                            {project.description && (
                                                <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
                                            )}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {project.client_name || "—"}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(project.id, project.title)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </Layout>
    );
}

export default Projects;
