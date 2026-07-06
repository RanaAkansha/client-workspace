import {
    Upload, MessageSquare, CheckCircle, AlertCircle,
    FileText, RefreshCw, Circle, FolderPlus
} from "lucide-react";

const TYPE_CONFIG = {
    project_created: { icon: FolderPlus, color: "text-blue-600 bg-blue-50 border-blue-100" },
    deliverable_uploaded: { icon: Upload, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    status_changed: { icon: RefreshCw, color: "text-amber-600 bg-amber-50 border-amber-100" },
    comment_added: { icon: MessageSquare, color: "text-gray-600 bg-gray-50 border-gray-200" },
    review_requested: { icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-100" },
    approved: { icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    changes_requested: { icon: AlertCircle, color: "text-orange-600 bg-orange-50 border-orange-100" },
};

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatDay(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const oneDay = 86400000;

    if (diff < oneDay && date.getDate() === now.getDate()) return "Today";
    if (diff < 2 * oneDay) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function ActivityTimeline({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-gray-500 font-medium">No activity yet.</p>
                <p className="text-xs text-gray-400 mt-1">Events will appear here as work progresses.</p>
            </div>
        );
    }

    // Group activities by day
    const grouped = {};
    activities.forEach((activity) => {
        const day = formatDay(activity.created_at);
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(activity);
    });

    return (
        <div className="space-y-5">
            {Object.entries(grouped).map(([day, items]) => (
                <div key={day}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {day}
                    </p>
                    <div className="space-y-2">
                        {items.map((activity) => {
                            const config = TYPE_CONFIG[activity.type] || {
                                icon: Circle,
                                color: "text-gray-500 bg-gray-50 border-gray-200",
                            };
                            const Icon = config.icon;

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 py-2"
                                >
                                    <span className="text-[11px] font-semibold text-gray-400 w-10 flex-shrink-0 pt-0.5 tabular-nums">
                                        {formatTime(activity.created_at)}
                                    </span>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border flex-shrink-0 ${config.color}`}>
                                        <Icon size={12} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                                            {activity.message}
                                        </p>
                                        {activity.user_name && (
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                                                {activity.user_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ActivityTimeline;
