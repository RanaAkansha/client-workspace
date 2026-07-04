import { useEffect, useState } from "react";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { ErrorBanner } from "../component/shared";
import { formatDate } from "../utils/formatDate";
import { Trash2 } from "lucide-react";

function Deliverables() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [deliverables, setDeliverables] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        project_id: "",
        title: "",
        description: "",
        file_url: "",
    });

    const fetchDeliverables = async () => {
        try {
            const res = await api.get("/deliverables");
            setDeliverables(res.data.deliverables);
        } catch (err) {
            setError("Failed to load deliverables.");
            console.error(err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get("/projects");
            setProjects(res.data.projects);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDeliverables(), fetchProjects()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project_id || !formData.title || !formData.file_url) {
            setError("Project, title and file URL are required.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await api.post("/deliverables", formData);
            setFormData({ project_id: "", title: "", description: "", file_url: "" });
            await fetchDeliverables();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload deliverable.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete the file "${title}"?`)) {
            return;
        }
        try {
            await api.delete(`/deliverables/${id}`);
            await fetchDeliverables();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete deliverable.");
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Deliverables</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                            ? "Upload and manage files shared with clients."
                            : "Files and assets your agency has shared with you."}
                    </p>
                </div>

                <ErrorBanner message={error} />

                {/* Upload form — admin only */}
                {isAdmin && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-5">Upload Deliverable</h2>

                        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="project_id"
                                    value={formData.project_id}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white"
                                >
                                    <option value="">Select project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Homepage Mockup v2"
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
                                    rows="3"
                                    name="description"
                                    placeholder="Optional notes about this file..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    File URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    name="file_url"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.file_url}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400"
                                />
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Uploading..." : "Upload Deliverable"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Deliverables table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">
                            {isAdmin ? "All Deliverables" : "Your Files"}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-400">Loading deliverables...</p>
                        </div>
                    ) : deliverables.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No deliverables found.</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {isAdmin
                                    ? "Start by sharing a deliverable using the upload form above."
                                    : "Shared files will appear here once uploaded by the agency."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {isAdmin ? "Uploaded by" : "Shared by"}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">File</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {deliverables.map((item) => (
                                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.project_title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.uploaded_by_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.uploaded_at)}</td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={item.file_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-gray-900 underline underline-offset-2 hover:text-gray-600 transition"
                                            >
                                                Open
                                            </a>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                    title="Delete File"
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

export default Deliverables;