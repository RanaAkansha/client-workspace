import { Check } from "lucide-react";

const STEPS = [
    { key: "draft", label: "Draft" },
    { key: "ready_for_review", label: "Review" },
    { key: "client_reviewing", label: "Feedback" },
    { key: "approved", label: "Approved" },
    { key: "completed", label: "Complete" },
];

// "changes_requested" maps to the "Feedback" step (index 2) but shows as a variant
function getStepIndex(status) {
    if (status === "changes_requested") return 2;
    const idx = STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
}

function ReviewProgress({ status }) {
    if (!status) return null;

    const currentIndex = getStepIndex(status);
    const isChangesRequested = status === "changes_requested";

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Review Progress
            </p>
            <div className="flex items-center gap-1">
                {STEPS.map((step, i) => {
                    const isCompleted = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    const isWarning = isCurrent && isChangesRequested;

                    let dotColor = "bg-gray-200";
                    if (isCompleted) dotColor = "bg-emerald-500";
                    if (isCurrent && !isWarning) dotColor = "bg-blue-500";
                    if (isWarning) dotColor = "bg-orange-500";

                    return (
                        <div key={step.key} className="flex items-center gap-1 flex-1">
                            <div className="flex flex-col items-center gap-1.5 flex-1">
                                <div className={`w-full h-1.5 rounded-full ${dotColor} transition-colors duration-200`} />
                                <span className={`text-[10px] font-medium ${
                                    isCurrent ? (isWarning ? "text-orange-600" : "text-blue-600") :
                                    isCompleted ? "text-emerald-600" : "text-gray-400"
                                }`}>
                                    {isWarning ? "Changes" : step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ReviewProgress;
