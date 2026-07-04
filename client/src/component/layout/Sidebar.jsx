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
            <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm flex-shrink-0">
                    C
                </div>
                <div>
                    <p className="text-sm font-bold tracking-tight text-gray-900 leading-none">Client Workspace</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Apex Creative Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-5 space-y-1.5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                                ${isActive
                                    ? "bg-indigo-50/65 text-indigo-600 border border-indigo-100/30 shadow-sm"
                                    : "text-slate-650 hover:bg-slate-50 hover:text-indigo-600"
                                }`
                            }
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3.5 py-2.5 w-full text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-all duration-150 cursor-pointer"
                >
                    <LogOut size={16} />
                    Sign out
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;