import { LayoutDashboard, FolderKanban, FileText, MessageSquare, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects",  path: "/projects",  icon: FolderKanban  },
    { name: "Deliverables", path: "/deliverables", icon: FileText },
    { name: "Comments",  path: "/comments",  icon: MessageSquare },
];

function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

            {/* Brand */}
            <div className="px-6 py-6 border-b border-gray-200">
                <p className="text-base font-semibold tracking-tight text-gray-900">Client Workspace</p>
                <p className="text-xs text-gray-400 mt-0.5">Client Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors
                                ${isActive
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <Icon size={16} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    Sign out
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;