import { StatusBadge } from "./shared";
import { formatDate } from "../utils/formatDate";
import { ExternalLink } from "lucide-react";

function DeliverableCard({ deliverable, isLatest = false }) {
    const initials = deliverable.uploaded_by_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "?";

    return (
        <div className={`bg-white border rounded-xl p-5 transition-all duration-150 ${
            isLatest ? "border-gray-300 shadow-sm" : "border-gray-200"
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {deliverable.title}
                        </h4>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                            v{deliverable.version}
                        </span>
                        <StatusBadge status={deliverable.status} type="deliverable" />
                        {isLatest && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Latest
                            </span>
                        )}
                    </div>
                    {deliverable.description && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-lg">
                            {deliverable.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-[9px] font-bold">
                                {initials}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                                {deliverable.uploaded_by_name}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {formatDate(deliverable.uploaded_at)}
                        </span>
                    </div>
                </div>
                <a
                    href={deliverable.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg transition flex-shrink-0"
                >
                    <ExternalLink size={12} />
                    Open
                </a>
            </div>
        </div>
    );
}

export default DeliverableCard;
