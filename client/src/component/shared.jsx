// Workflow status styles for deliverables
const DELIVERABLE_STATUS_STYLES = {
    draft: "bg-gray-50 text-gray-600 border border-gray-200",
    ready_for_review: "bg-blue-50 text-blue-700 border border-blue-200",
    client_reviewing: "bg-amber-50 text-amber-700 border border-amber-200",
    changes_requested: "bg-orange-50 text-orange-700 border border-orange-200",
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const DELIVERABLE_STATUS_LABELS = {
    draft: "Draft",
    ready_for_review: "Ready for Review",
    client_reviewing: "Client Reviewing",
    changes_requested: "Changes Requested",
    approved: "Approved",
    completed: "Completed",
};

// Project-level status styles (preserve existing behavior)
const PROJECT_STATUS_STYLES = {
    Planning: "bg-slate-50 text-slate-600 border border-slate-200",
    Active: "bg-blue-50 text-blue-700 border border-blue-200",
    "In Review": "bg-amber-50 text-amber-700 border border-amber-200",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export function StatusBadge({ status, type = "project" }) {
    const styles = type === "deliverable" ? DELIVERABLE_STATUS_STYLES : PROJECT_STATUS_STYLES;
    const labels = type === "deliverable" ? DELIVERABLE_STATUS_LABELS : null;

    const style = styles[status] || "bg-slate-50 text-slate-600 border border-slate-200";
    const label = labels ? (labels[status] || status) : status;

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${style}`}>
            {label}
        </span>
    );
}

// Inline error banner — used on every page with form submission
export function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {message}
        </div>
    );
}

export { DELIVERABLE_STATUS_LABELS };
