import { useEffect, useState } from "react";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { StatusBadge, ErrorBanner } from "../component/shared";
import { formatDate } from "../utils/formatDate";

function Dashboard() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/dashboard");
                setDashboard(res.data);
            } catch (err) {
                setError("Failed to load dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const firstName = user?.name?.split(" ")[0] || "there";

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <div>
                        <div className="h-8 bg-gray-100 rounded w-56 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                    <div className="grid grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                                <div className="h-3 bg-gray-100 rounded w-16 mb-3" />
                                <div className="h-8 bg-gray-100 rounded w-10" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-gray-100 rounded w-full" />
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <ErrorBanner message={error} />
            </Layout>
        );
    }

    const stats = isAdmin
        ? [
            { label: "Projects", value: dashboard.stats.projects },
            { label: "Clients", value: dashboard.stats.clients },
            { label: "Deliverables", value: dashboard.stats.deliverables },
            { label: "Comments", value: dashboard.stats.comments },
          ]
        : [
            { label: "Projects", value: dashboard.stats.projects },
            { label: "Deliverables", value: dashboard.stats.deliverables },
            { label: "Comments", value: dashboard.stats.comments },
          ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Greeting */}
                <div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                        Welcome back, {firstName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAdmin
                            ? "Workspace Overview — Apex Creative Agency"
                            : "Workspace Overview — Apex Creative Agency"}
                    </p>
                </div>

                {/* Stats */}
                <div className={`grid gap-5 ${isAdmin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white border border-gray-200 rounded-xl p-6"
                        >
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-semibold mt-2 text-gray-900">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Recent Projects */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-base font-semibold">
                            {isAdmin ? "Recent Projects" : "Your Projects"}
                        </h3>
                    </div>

                    {dashboard.recentProjects.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No projects found.</p>
                            <p className="text-xs text-gray-400 mt-1">Active projects will show up here once created.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentProjects.map((project) => (
                                    <tr key={project.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{project.client_name}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Deliverables */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-base font-semibold">Recent Deliverables</h3>
                    </div>

                    {dashboard.recentDeliverables.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No deliverables uploaded yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Shared files and links will be visible here.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Uploaded by</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">File</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.recentDeliverables.map((item) => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Comments */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-base font-semibold">Recent Comments</h3>
                    </div>

                    {dashboard.recentComments.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No comments logged yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Recent client-agency discussions will be shown here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {dashboard.recentComments.map((comment) => (
                                <div key={comment.id} className="px-6 py-4 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0 mt-0.5">
                                            {comment.user_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {comment.user_name}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    on {comment.project_title}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                                                {comment.message}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}

export default Dashboard;