import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const pageTitles = {
    "/dashboard":    "Dashboard",
    "/projects":     "Projects",
    "/deliverables": "Deliverables",
    "/comments":     "Comments",
};

function Navbar() {
    const location = useLocation();
    const { user } = useAuth();

    // Get first letter for avatar
    const initial = user?.name?.charAt(0).toUpperCase() || "?";

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">

            <p className="text-base font-semibold text-gray-900">
                {pageTitles[location.pathname] || "Client Workspace"}
            </p>

            {/* User pill */}
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                    {initial}
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
                </div>
            </div>

        </header>
    );
}

export default Navbar;