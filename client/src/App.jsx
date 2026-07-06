import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Deliverables from "./pages/Deliverables";
import Register from "./pages/Register";
import Comments from "./pages/Comments";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects"
                element={
                    <ProtectedRoute>
                        <Projects />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects/:id"
                element={
                    <ProtectedRoute>
                        <ProjectDetail />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/deliverables"
                element={
                    <ProtectedRoute>
                        <Deliverables />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/comments"
                element={
                    <ProtectedRoute>
                        <Comments />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;