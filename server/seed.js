const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

async function seed() {
    console.log("Starting database seeding (workflow-aware workspace data)...");

    try {
        // Drop and recreate tables to ensure schema is correct
        console.log("Dropping existing tables...");
        await pool.query("DROP TABLE IF EXISTS activities, comments, deliverables, projects, users CASCADE");

        console.log("Creating tables with updated schema...");

        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'client',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(30) DEFAULT 'Planning',
                client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                deadline TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE deliverables (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_url TEXT NOT NULL,
                uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                version INTEGER DEFAULT 1,
                status VARCHAR(30) DEFAULT 'draft',
                uploaded_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE comments (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE activities (
                id SERIAL PRIMARY KEY,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Hash passwords
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
        const clientPasswordHash = await bcrypt.hash("client123", saltRounds);

        // Insert Admin
        console.log("Inserting admin user...");
        const adminRes = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ["Akansha Rana", "akansha@agency.com", adminPasswordHash, "admin"]);
        const adminId = adminRes.rows[0].id;

        // Insert Clients
        console.log("Inserting client users...");
        const client1Res = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ["Sarah Jenkins", "sarah@novasmarthome.com", clientPasswordHash, "client"]);
        const client1Id = client1Res.rows[0].id;

        const client2Res = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ["Marcus Vance", "marcus@aerocapital.com", clientPasswordHash, "client"]);
        const client2Id = client2Res.rows[0].id;

        // Insert Projects
        console.log("Inserting projects...");

        // Project 1 — Active, mid-workflow
        const p1Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, deadline, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '14 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day')
            RETURNING id
        `, [
            "Corporate Website Redesign",
            "Redesign and modernize the Nova Smart Home e-commerce store. Build custom interactive product grids, optimize page flow, and integrate their smart device inventory API.",
            "Active",
            client1Id,
            adminId
        ]);
        const p1Id = p1Res.rows[0].id;

        // Project 2 — Completed
        const p2Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, deadline, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days')
            RETURNING id
        `, [
            "Brand Identity System",
            "Comprehensive visual brand guide, typography selection, custom color palettes, and social media templates for the new product launch.",
            "Completed",
            client1Id,
            adminId
        ]);
        const p2Id = p2Res.rows[0].id;

        // Project 3 — In Review
        const p3Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, deadline, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day')
            RETURNING id
        `, [
            "Client Portal Development",
            "Design and implement a responsive client portal workspace with secure authentication, calendar widgets, and document collaboration features.",
            "In Review",
            client2Id,
            adminId
        ]);
        const p3Id = p3Res.rows[0].id;

        // Project 4 — Planning
        const p4Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, deadline, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
            RETURNING id
        `, [
            "SEO Strategy & Audit",
            "Perform comprehensive competitor keyword analysis and technical on-page SEO optimization for their financial blog network.",
            "Planning",
            client2Id,
            adminId
        ]);
        const p4Id = p4Res.rows[0].id;

        // Insert Deliverables with versions and workflow statuses
        console.log("Inserting deliverables...");

        // Project 1 deliverables — showing version progression
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '10 days')
        `, [p1Id, "Homepage Design", "Initial high-fidelity mockup for the desktop homepage layout.", "https://figma.com/file/homepage-v1", adminId, 1, "changes_requested"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '7 days')
        `, [p1Id, "Homepage Design", "Revised mockup with updated hero section and CTA placement.", "https://figma.com/file/homepage-v2", adminId, 2, "approved"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '5 days')
        `, [p1Id, "Product Grid Component", "Interactive product grid with filtering and sort functionality.", "https://figma.com/file/product-grid-v1", adminId, 1, "approved"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '1 day')
        `, [p1Id, "Mobile Responsive Layout", "Mobile-first responsive design for all key pages.", "https://figma.com/file/mobile-v1", adminId, 1, "client_reviewing"]);

        // Project 2 deliverables — all approved/completed
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '6 days')
        `, [p2Id, "Brand Guidelines", "Core typography, color palettes, logo usage patterns, and visual asset templates.", "https://docs.google.com/document/d/brand-guidelines", adminId, 1, "completed"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '3 days')
        `, [p2Id, "Social Media Templates", "Instagram, Twitter, and LinkedIn post templates with brand assets.", "https://figma.com/file/social-templates", adminId, 1, "completed"]);

        // Project 3 deliverables — in review workflow
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '3 days')
        `, [p3Id, "Dashboard Wireframes", "UX wireframes for the client dashboard views and navigation flows.", "https://figma.com/file/wireframes-v1", adminId, 1, "changes_requested"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '1 day')
        `, [p3Id, "Dashboard Wireframes", "Updated wireframes with revised navigation and checkout flow.", "https://figma.com/file/wireframes-v2", adminId, 2, "client_reviewing"]);

        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [p3Id, "Design System", "Comprehensive pattern library with reusable layout modules.", "https://figma.com/file/design-system-v1", adminId, 1, "ready_for_review"]);

        // Project 4 — draft stage
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, version, status, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [p4Id, "SEO Audit Report", "Keyword gap analysis, competitor audit, and schema recommendations.", "https://docs.google.com/document/d/seo-audit", adminId, 1, "draft"]);

        // Insert Comments
        console.log("Inserting comments...");

        // Project 1 comments
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '10 days')`,
            [p1Id, client1Id, "Hi Akansha, the homepage layout looks stunning! Could we verify if the primary CTA has a hover state in the mockup?"]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '10 days' + INTERVAL '30 minutes')`,
            [p1Id, adminId, "Hi Sarah! Yes, we have added smooth hover transitions to all main buttons. You can preview them in the Figma link."]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '7 days')`,
            [p1Id, client1Id, "The revised hero section in v2 is exactly what we wanted. Approving this version."]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '1 day')`,
            [p1Id, adminId, "I've uploaded the mobile responsive layout for your review. Let me know if the navigation feels right on smaller screens."]);

        // Project 2 comments
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '5 days')`,
            [p2Id, client1Id, "Thanks for the brand guidelines. The typographic hierarchy and color palette are exactly what we envisioned."]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '5 days' + INTERVAL '2 hours')`,
            [p2Id, adminId, "Perfect! We've exported the asset package with all logo variants and CSS tokens for development."]);

        // Project 3 comments
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '2 days')`,
            [p3Id, client2Id, "Could we review the latest dashboard layouts? The onboarding flow looks clean."]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '2 days' + INTERVAL '1 hour')`,
            [p3Id, adminId, "Hi Marcus! Let's sync tomorrow at 10 AM to walk through the layouts and finalize checkout screens."]);
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '1 day')`,
            [p3Id, client2Id, "Sounds perfect. I'll add our product manager to the invite. See you then!"]);

        // Project 4 comments
        await pool.query(`INSERT INTO comments (project_id, user_id, message, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '4 hours')`,
            [p4Id, adminId, "Hi Marcus! I've uploaded the draft SEO Audit Report with key search queries and competitor analysis. Let me know your thoughts."]);

        // Insert Activities
        console.log("Inserting activity history...");

        // Project 1 activities
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '10 days')`,
            [p1Id, adminId, "project_created", "Project created", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '10 days')`,
            [p1Id, adminId, "deliverable_uploaded", "Homepage Design v1 uploaded", '{"deliverable_title": "Homepage Design", "version": 1}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '9 days')`,
            [p1Id, adminId, "status_changed", "Homepage Design moved to Ready for Review", '{"old_status": "draft", "new_status": "ready_for_review"}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '8 days')`,
            [p1Id, client1Id, "status_changed", "Homepage Design — changes requested", '{"old_status": "client_reviewing", "new_status": "changes_requested"}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '7 days')`,
            [p1Id, adminId, "deliverable_uploaded", "Homepage Design v2 uploaded", '{"deliverable_title": "Homepage Design", "version": 2}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '7 days' + INTERVAL '2 hours')`,
            [p1Id, client1Id, "approved", "Homepage Design v2 approved", '{"deliverable_title": "Homepage Design", "version": 2}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '5 days')`,
            [p1Id, adminId, "deliverable_uploaded", "Product Grid Component v1 uploaded", '{"deliverable_title": "Product Grid Component", "version": 1}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '4 days')`,
            [p1Id, client1Id, "approved", "Product Grid Component approved", '{"deliverable_title": "Product Grid Component", "version": 1}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '1 day')`,
            [p1Id, adminId, "deliverable_uploaded", "Mobile Responsive Layout v1 uploaded", '{"deliverable_title": "Mobile Responsive Layout", "version": 1}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '1 day' + INTERVAL '1 hour')`,
            [p1Id, adminId, "review_requested", "Review requested from client", '{}']);

        // Project 2 activities
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '8 days')`,
            [p2Id, adminId, "project_created", "Project created", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '6 days')`,
            [p2Id, adminId, "deliverable_uploaded", "Brand Guidelines v1 uploaded", '{"deliverable_title": "Brand Guidelines", "version": 1}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '5 days')`,
            [p2Id, client1Id, "approved", "Brand Guidelines approved", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '3 days')`,
            [p2Id, adminId, "deliverable_uploaded", "Social Media Templates v1 uploaded", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days')`,
            [p2Id, client1Id, "approved", "Social Media Templates approved", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days')`,
            [p2Id, adminId, "status_changed", "Project marked as Completed", '{"old_status": "Active", "new_status": "Completed"}']);

        // Project 3 activities
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '4 days')`,
            [p3Id, adminId, "project_created", "Project created", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '3 days')`,
            [p3Id, adminId, "deliverable_uploaded", "Dashboard Wireframes v1 uploaded", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days')`,
            [p3Id, client2Id, "status_changed", "Dashboard Wireframes — changes requested", '{"old_status": "client_reviewing", "new_status": "changes_requested"}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '1 day')`,
            [p3Id, adminId, "deliverable_uploaded", "Dashboard Wireframes v2 uploaded", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [p3Id, adminId, "deliverable_uploaded", "Design System v1 uploaded", '{}']);

        // Project 4 activities
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days')`,
            [p4Id, adminId, "project_created", "Project created", '{}']);
        await pool.query(`INSERT INTO activities (project_id, user_id, type, message, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [p4Id, adminId, "deliverable_uploaded", "SEO Audit Report v1 uploaded", '{}']);

        console.log("Database seeded successfully with workflow-aware data!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        pool.end();
    }
}

seed();
