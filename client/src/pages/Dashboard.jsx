import { useEffect, useState } from "react";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { StatusBadge, ErrorBanner } from "../component/shared";
import { formatDate } from "../utils/formatDate";
import { FolderKanban, Users, FileText, MessageSquare } from "lucide-react";

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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6">
                                <div className="h-3 bg-gray-150 rounded w-16 mb-3" />
                                <div className="h-8 bg-gray-150 rounded w-10" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
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

    // Build the visual stats cards config
    const stats = isAdmin
        ? [
            { label: "Projects", value: dashboard.stats.projects, icon: FolderKanban, color: "text-indigo-650 bg-indigo-50 border-indigo-100/60", trend: "Active" },
            { label: "Clients", value: dashboard.stats.clients, icon: Users, color: "text-purple-650 bg-purple-50 border-purple-100/60", trend: "Total" },
            { label: "Deliverables", value: dashboard.stats.deliverables, icon: FileText, color: "text-pink-650 bg-pink-50 border-pink-100/60", trend: "Files" },
            { label: "Comments", value: dashboard.stats.comments, icon: MessageSquare, color: "text-emerald-650 bg-emerald-50 border-emerald-100/60", trend: "Activity" },
          ]
        : [
            { label: "Projects", value: dashboard.stats.projects, icon: FolderKanban, color: "text-indigo-650 bg-indigo-50 border-indigo-100/60", trend: "Active" },
            { label: "Deliverables", value: dashboard.stats.deliverables, icon: FileText, color: "text-purple-650 bg-purple-50 border-purple-100/60", trend: "Files" },
            { label: "Comments", value: dashboard.stats.comments, icon: MessageSquare, color: "text-emerald-650 bg-emerald-50 border-emerald-100/60", trend: "Activity" },
          ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Workspace Overview
                        </h2>
                        <p className="text-sm font-medium text-gray-550 mt-1">
                            Manage projects, deliverables, and client communication from a single workspace.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className={`grid gap-6 ${isAdmin ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const isPercentageTrend = stat.trend.startsWith("+");
                        return (
                            <div
                                key={stat.label}
                                className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group relative"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {stat.label}
                                    </span>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.color}`}>
                                        <Icon size={16} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline justify-between">
                                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                        {stat.value}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isPercentageTrend 
                                            ? "text-emerald-700 bg-emerald-50 border border-emerald-100/60" 
                                            : "text-indigo-700 bg-indigo-50 border border-indigo-100/60"
                                    }`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Two Column Grid on Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Recent Projects */}
                    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                {isAdmin ? "Recent Projects" : "Your Projects"}
                            </h3>
                        </div>

                        {dashboard.recentProjects.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium text-gray-500">No projects found.</p>
                                <p className="text-xs text-gray-400 mt-1">Active projects will show up here once created.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100 bg-slate-50/20">
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dashboard.recentProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-slate-50/50 transition duration-150">
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{project.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{project.client_name}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={project.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Deliverables */}
                    <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider bg-slate-50/50">
                                Recent Deliverables
                            </h3>
                        </div>

                        {dashboard.recentDeliverables.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium text-gray-500">No deliverables uploaded yet.</p>
                                <p className="text-xs text-gray-400 mt-1">Shared files and links will be visible here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left border-b border-gray-100 bg-slate-50/20">
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dashboard.recentDeliverables.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900 leading-none">{item.title}</p>
                                                    <span className="text-[10px] text-gray-400 font-medium mt-1 inline-block">Shared: {formatDate(item.uploaded_at)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-gray-500">{item.project_title}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <a
                                                        href={item.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/60 px-3 py-1.5 rounded-lg transition"
                                                    >
                                                        Open
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>

                {/* Recent Comments */}
                <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                            Recent Activity
                        </h3>
                    </div>

                    {dashboard.recentComments.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-500">No comments logged yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Recent client-agency discussions will be shown here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {dashboard.recentComments.map((comment) => {
                                // Extract first letters of the user's name to use as avatar
                                const initials = comment.user_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2) || "?";

                                return (
                                    <div key={comment.id} className="px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50/30 transition">
                                        <div className="flex items-start gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-55/70 border border-indigo-100/40 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {comment.user_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-450 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                                                        on {comment.project_title}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-650 mt-1 leading-relaxed max-w-2xl font-medium">
                                                    {comment.message}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-400 bg-slate-50 px-2 py-1 border border-slate-100 rounded-lg flex-shrink-0">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}

export default Dashboard;