import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { StatusBadge, ErrorBanner } from "../component/shared";
import DeliverableCard from "../component/DeliverableCard";
import ActivityTimeline from "../component/ActivityTimeline";
import ActionBar from "../component/ActionBar";
import ReviewProgress from "../component/ReviewProgress";
import { formatDate, formatDateTime } from "../utils/formatDate";
import { ArrowLeft, Calendar, User, Users, Trash2, ChevronDown, ChevronUp } from "lucide-react";

function ProjectDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [project, setProject] = useState(null);
    const [deliverables, setDeliverables] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [showAllVersions, setShowAllVersions] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: "", description: "", file_url: "" });

    const bottomRef = useRef(null);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/projects/${id}`);
            setProject(res.data.project);
            setDeliverables(res.data.deliverables);
            setComments(res.data.comments);
            setActivities(res.data.activities);
            setStats(res.data.stats);
        } catch (err) {
            setError("Failed to load project.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);
        setError("");
        try {
            await api.post("/comments", {
                project_id: id,
                message: message.trim(),
            });
            setMessage("");
            await fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post message.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            await fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment.");
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!latestDeliverable) return;
        setStatusSubmitting(true);
        try {
            await api.patch(`/deliverables/${latestDeliverable.id}/status`, { status: newStatus });
            await fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
        } finally {
            setStatusSubmitting(false);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.title || !uploadForm.file_url) {
            setError("Title and file URL are required.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            await api.post("/deliverables", {
                project_id: id,
                title: uploadForm.title,
                description: uploadForm.description,
                file_url: uploadForm.file_url,
            });
            setUploadForm({ title: "", description: "", file_url: "" });
            setShowUploadForm(false);
            await fetchProject();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload deliverable.");
        } finally {
            setSubmitting(false);
        }
    };

    const isMine = (comment) => comment.user_id === user?.id;
    const canDelete = (comment) => user?.role === "admin" || comment.user_id === user?.id;

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto animate-pulse space-y-6">
                    <div className="h-6 bg-gray-100 rounded w-32" />
                    <div className="h-8 bg-gray-100 rounded w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                        <div className="space-y-4">
                            <div className="h-40 bg-gray-100 rounded-xl" />
                            <div className="h-60 bg-gray-100 rounded-xl" />
                        </div>
                        <div className="h-80 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (error && !project) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto">
                    <ErrorBanner message={error} />
                </div>
            </Layout>
        );
    }

    const latestDeliverable = deliverables.length > 0 ? deliverables[0] : null;
    const olderDeliverables = deliverables.length > 1 ? deliverables.slice(1) : [];

    const clientInitials = project?.client_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "?";

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Back link + Header */}
                <div>
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 transition mb-4"
                    >
                        <ArrowLeft size={14} />
                        Back to Projects
                    </Link>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                                    {project.title}
                                </h1>
                                <StatusBadge status={project.status} type="project" />
                            </div>
                            {project.description && (
                                <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <ErrorBanner message={error} />

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

                    {/* Left Column — Main content */}
                    <div className="space-y-6 min-w-0">

                        {/* Latest Deliverable */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Latest Deliverable
                            </h3>
                            {latestDeliverable ? (
                                <DeliverableCard deliverable={latestDeliverable} isLatest />
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                                    <p className="text-sm text-gray-500 font-medium">No deliverables uploaded yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {isAdmin ? "Upload a deliverable to start the review workflow." : "Your agency hasn't shared any deliverables yet."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Upload Form (Admin only, toggled) */}
                        {isAdmin && showUploadForm && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    Upload New Deliverable
                                </h3>
                                <form onSubmit={handleUploadSubmit} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Homepage Design"
                                            value={uploadForm.title}
                                            onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows="2"
                                            placeholder="Optional notes..."
                                            value={uploadForm.description}
                                            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                                            File URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://figma.com/..."
                                            value={uploadForm.file_url}
                                            onChange={(e) => setUploadForm({ ...uploadForm, file_url: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-40 cursor-pointer"
                                        >
                                            {submitting ? "Uploading..." : "Upload"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadForm(false)}
                                            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {isAdmin && !showUploadForm && (
                            <button
                                onClick={() => setShowUploadForm(true)}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition cursor-pointer"
                            >
                                + Upload new deliverable
                            </button>
                        )}

                        {/* Version History */}
                        {olderDeliverables.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowAllVersions(!showAllVersions)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition cursor-pointer"
                                >
                                    Version History ({olderDeliverables.length})
                                    {showAllVersions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                                {showAllVersions && (
                                    <div className="space-y-3">
                                        {olderDeliverables.map((d) => (
                                            <DeliverableCard key={d.id} deliverable={d} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Discussion Thread */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Discussion
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                    {comments.length} {comments.length === 1 ? "message" : "messages"}
                                </p>
                            </div>

                            <div className="px-5 py-4 space-y-5 overflow-y-auto" style={{ maxHeight: "400px" }}>
                                {comments.length === 0 && (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-gray-500 font-medium">No messages yet.</p>
                                        <p className="text-xs text-gray-400 mt-1">Start the conversation below.</p>
                                    </div>
                                )}

                                {comments.map((comment) => {
                                    const mine = isMine(comment);
                                    const initials = comment.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .substring(0, 2) || "?";

                                    return (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border ${
                                                comment.user_role === "admin"
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                            }`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-800">
                                                        {mine ? "You" : comment.name}
                                                    </span>
                                                    {comment.user_role === "admin" && (
                                                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            Agency
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {formatDateTime(comment.created_at)}
                                                    </span>
                                                    {canDelete(comment) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-gray-300 hover:text-red-500 transition cursor-pointer ml-auto"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                                    {comment.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Reply box */}
                            <div className="px-5 py-4 border-t border-gray-100">
                                <form onSubmit={handleCommentSubmit} className="flex gap-2 items-end">
                                    <textarea
                                        rows="2"
                                        placeholder="Write a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleCommentSubmit(e);
                                        }}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || !message.trim()}
                                        className="bg-gray-900 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-40 flex-shrink-0 cursor-pointer"
                                    >
                                        {submitting ? "..." : "Send"}
                                    </button>
                                </form>
                                <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                                    Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Ctrl+Enter</kbd> to send
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column — Sidebar */}
                    <div className="space-y-5">

                        {/* Action Bar */}
                        {latestDeliverable && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Action
                                </p>
                                <ActionBar
                                    status={latestDeliverable.status}
                                    isAdmin={isAdmin}
                                    onStatusChange={handleStatusChange}
                                    onRequestUpload={() => setShowUploadForm(true)}
                                    submitting={statusSubmitting}
                                />
                            </div>
                        )}

                        {/* Review Progress */}
                        {latestDeliverable && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <ReviewProgress status={latestDeliverable.status} />
                            </div>
                        )}

                        {/* Project Info */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Project Info
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center">
                                        <User size={13} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Client</p>
                                        <p className="text-sm text-gray-800 font-medium">{project.client_name}</p>
                                    </div>
                                </div>
                                {project.created_by_name && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center">
                                            <Users size={13} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Assigned Team</p>
                                            <p className="text-sm text-gray-800 font-medium">{project.created_by_name}</p>
                                        </div>
                                    </div>
                                )}
                                {project.deadline && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center">
                                            <Calendar size={13} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Deadline</p>
                                            <p className="text-sm text-gray-800 font-medium">{formatDate(project.deadline)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{stats.total_deliverables || 0}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold">Deliverables</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{stats.approved || 0}</p>
                                    <p className="text-[10px] text-emerald-600 font-semibold">Approved</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">{stats.pending_review || 0}</p>
                                    <p className="text-[10px] text-amber-600 font-semibold">Pending</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Activity
                            </p>
                            <ActivityTimeline activities={activities} />
                        </div>

                    </div>

                </div>
            </div>
        </Layout>
    );
}

export default ProjectDetail;
