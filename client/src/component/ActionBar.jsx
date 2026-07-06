import { DELIVERABLE_STATUS_LABELS } from "./shared";
import { Upload, Send, Clock, CheckCircle, ArrowRight } from "lucide-react";

const ACTION_CONFIG = {
    draft: {
        label: "Submit for Review",
        icon: Send,
        nextStatus: "ready_for_review",
        style: "bg-gray-900 text-white hover:bg-gray-800",
        adminOnly: true,
    },
    ready_for_review: {
        label: "Request Client Review",
        icon: ArrowRight,
        nextStatus: "client_reviewing",
        style: "bg-blue-600 text-white hover:bg-blue-700",
        adminOnly: true,
    },
    client_reviewing: {
        label: "Waiting for Feedback",
        icon: Clock,
        nextStatus: null,
        style: "bg-amber-50 text-amber-700 border border-amber-200 cursor-default",
        disabled: true,
        // For clients, this becomes two actions (approve / request changes)
    },
    changes_requested: {
        label: "Upload New Version",
        icon: Upload,
        nextStatus: null, // handled by upload flow
        style: "bg-orange-600 text-white hover:bg-orange-700",
        adminOnly: true,
    },
    approved: {
        label: "Mark Complete",
        icon: CheckCircle,
        nextStatus: "completed",
        style: "bg-emerald-600 text-white hover:bg-emerald-700",
        adminOnly: true,
    },
    completed: {
        label: "Completed",
        icon: CheckCircle,
        nextStatus: null,
        style: "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default",
        disabled: true,
    },
};

function ActionBar({ status, isAdmin, onStatusChange, onRequestUpload, submitting = false }) {
    if (!status) return null;

    const config = ACTION_CONFIG[status];
    if (!config) return null;

    // Client viewing a deliverable in "client_reviewing" state — show approve/reject
    if (status === "client_reviewing" && !isAdmin) {
        return (
            <div className="space-y-2">
                <button
                    onClick={() => onStatusChange("approved")}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer"
                >
                    <CheckCircle size={14} />
                    {submitting ? "Updating..." : "Approve"}
                </button>
                <button
                    onClick={() => onStatusChange("changes_requested")}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-orange-700 border border-orange-200 hover:bg-orange-50 transition disabled:opacity-40 cursor-pointer"
                >
                    Request Changes
                </button>
            </div>
        );
    }

    // Admin "waiting for feedback" state — show disabled state
    if (status === "client_reviewing" && isAdmin) {
        const Icon = config.icon;
        return (
            <button
                disabled
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${config.style} transition`}
            >
                <Icon size={14} />
                {config.label}
            </button>
        );
    }

    // Handle "Upload New Version" — triggers upload modal
    if (status === "changes_requested" && isAdmin) {
        const Icon = config.icon;
        return (
            <button
                onClick={onRequestUpload}
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${config.style} transition disabled:opacity-40 cursor-pointer`}
            >
                <Icon size={14} />
                {config.label}
            </button>
        );
    }

    // Standard action button
    if (config.disabled) {
        const Icon = config.icon;
        return (
            <button
                disabled
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${config.style} transition`}
            >
                <Icon size={14} />
                {config.label}
            </button>
        );
    }

    if (config.adminOnly && !isAdmin) return null;

    const Icon = config.icon;
    return (
        <button
            onClick={() => onStatusChange(config.nextStatus)}
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${config.style} transition disabled:opacity-40 cursor-pointer`}
        >
            <Icon size={14} />
            {submitting ? "Updating..." : config.label}
        </button>
    );
}

export default ActionBar;
