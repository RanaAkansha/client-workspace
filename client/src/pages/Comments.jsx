import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../component/layout/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import { ErrorBanner } from "../component/shared";
import { formatDateTime } from "../utils/formatDate";
import { Trash2, ExternalLink } from "lucide-react";

function Comments() {
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [message, setMessage] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const bottomRef = useRef(null);

    // Fetch all visible projects for the dropdown on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/projects");
                setProjects(res.data.projects);
            } catch (err) {
                setError("Failed to load projects.");
                console.error(err);
            }
        };
        fetchProjects();
    }, []);

    // Fetch comments whenever the selected project changes
    useEffect(() => {
        if (!selectedProject) return;
        const fetchComments = async () => {
            setCommentsLoading(true);
            try {
                const res = await api.get(`/comments/${selectedProject}`);
                setComments(res.data.comments);
            } catch (err) {
                setError("Failed to load comments.");
                console.error(err);
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    }, [selectedProject]);

    // Scroll to bottom whenever comments update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject || !message.trim()) return;

        setSubmitting(true);
        setError("");
        try {
            await api.post("/comments", {
                project_id: selectedProject,
                message: message.trim(),
            });
            setMessage("");
            const res = await api.get(`/comments/${selectedProject}`);
            setComments(res.data.comments);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post message.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }
        try {
            await api.delete(`/comments/${id}`);
            const res = await api.get(`/comments/${selectedProject}`);
            setComments(res.data.comments);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete comment.");
        }
    };

    // A message is "mine" if user_id matches
    const isMine = (comment) => comment.user_id === user?.id;

    // Check if current user is authorized to delete the comment
    const canDelete = (comment) => user?.role === "admin" || comment.user_id === user?.id;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Comments</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {user?.role === "admin"
                            ? "View and respond to client feedback on your projects."
                            : "Leave feedback and get updates from your agency team."}
                    </p>
                </div>

                <ErrorBanner message={error} />

                {/* Project selector */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Project
                        </label>
                        {selectedProject && (
                            <Link
                                to={`/projects/${selectedProject}`}
                                className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
                            >
                                <ExternalLink size={12} />
                                View Project
                            </Link>
                        )}
                    </div>
                    <select
                        value={selectedProject}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedProject(val);
                            if (!val) {
                                setComments([]);
                            }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white mt-2"
                    >
                        <option value="">Choose a project to view its thread...</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Chat thread */}
                {selectedProject && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl flex flex-col overflow-hidden shadow-sm" style={{ minHeight: "450px" }}>

                        {/* Thread header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                    {projects.find((p) => String(p.id) === String(selectedProject))?.title || "Discussion"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1 font-semibold">
                                    {comments.length} {comments.length === 1 ? "message" : "messages"} in this thread
                                </p>
                            </div>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto" style={{ maxHeight: "400px" }}>

                            {commentsLoading && (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-sm text-gray-400 animate-pulse">Loading messages...</p>
                                </div>
                            )}

                            {!commentsLoading && comments.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-36">
                                    <p className="text-sm font-semibold text-gray-500">No messages yet.</p>
                                    <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
                                        {user?.role === "admin"
                                            ? "Start the conversation with your client partner."
                                            : "Send your first message to coordinate with the agency."}
                                    </p>
                                </div>
                            )}

                            {!commentsLoading && comments.map((comment) => {
                                const mine = isMine(comment);
                                const allowedDelete = canDelete(comment);

                                // Extract initials
                                const initials = comment.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .substring(0, 2) || "?";

                                return (
                                    <div
                                        key={comment.id}
                                        className={`flex gap-3.5 ${mine ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 shadow-xs border
                                                ${mine
                                                    ? "bg-indigo-600 text-white border-indigo-700"
                                                    : comment.user_role === "admin"
                                                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {initials}
                                        </div>

                                        {/* Bubble Container */}
                                        <div className={`max-w-xs sm:max-w-md md:max-w-lg ${mine ? "items-end" : "items-start"} flex flex-col`}>
                                            {/* Sender + role tag */}
                                            <div className={`flex items-center gap-1.5 mb-1.5 ${mine ? "flex-row-reverse" : "flex-row"}`}>
                                                <span className="text-xs font-bold text-gray-700">
                                                    {mine ? "You" : comment.name}
                                                </span>
                                                {comment.user_role === "admin" && (
                                                    <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100/60 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        Agency
                                                    </span>
                                                )}
                                            </div>

                                            {/* Message bubble */}
                                            <div className="group relative flex items-center gap-2">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs border
                                                        ${mine
                                                            ? "bg-indigo-600 text-white rounded-tr-none border-indigo-700"
                                                            : "bg-slate-50 text-gray-800 rounded-tl-none border-slate-200/60"
                                                        }`}
                                                >
                                                    {comment.message}
                                                </div>

                                                {/* Delete comment icon button shown on hover/group */}
                                                {allowedDelete && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className={`text-gray-400 hover:text-red-650 transition flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer
                                                            ${mine ? "order-first" : "order-last"}`}
                                                        title="Delete Comment"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <span className="text-[10px] font-semibold text-gray-400 mt-1.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                {formatDateTime(comment.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={bottomRef} />
                        </div>

                        {/* Reply box */}
                        <div className="px-6 py-4.5 border-t border-gray-150 bg-slate-50/20">
                            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                                <textarea
                                    rows="2"
                                    placeholder="Write a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e);
                                    }}
                                    className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !message.trim()}
                                    className="bg-indigo-650 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-indigo-750 active:bg-indigo-850 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
                                >
                                    {submitting ? "..." : "Send"}
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-400 font-medium mt-2">
                                Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Ctrl+Enter</kbd> to send instantly
                            </p>
                        </div>

                    </div>
                )}

            </div>
        </Layout>
    );
}

export default Comments;
