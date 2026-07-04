const STATUS_STYLES = {
    Planning: "bg-slate-50 text-slate-600 border border-slate-200/80",
    Active: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    "In Review": "bg-amber-50 text-amber-700 border border-amber-200/70",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
};

export function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border border-slate-250";
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ${style}`}>
            {status}
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
