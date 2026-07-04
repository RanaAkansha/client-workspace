const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

async function seed() {
    console.log("Starting database seeding (clean setup with rich workspace data)...");

    try {
        // Clear all existing data
        console.log("Clearing all tables...");
        await pool.query("TRUNCATE TABLE comments, deliverables, projects, users RESTART IDENTITY CASCADE");

        // Hash passwords
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
        const clientPasswordHash = await bcrypt.hash("client123", saltRounds);

        // Insert Admin (Agency Owner / Lead Designer)
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
        `, ["Sarah Jenkins (Nova Smart Home)", "sarah@novasmarthome.com", clientPasswordHash, "client"]);
        const client1Id = client1Res.rows[0].id;

        const client2Res = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ["Marcus Vance (Aero Capital)", "marcus@aerocapital.com", clientPasswordHash, "client"]);
        const client2Id = client2Res.rows[0].id;

        // Insert Projects
        console.log("Inserting projects...");
        
        // Project 1
        const p1Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
            RETURNING id
        `, [
            "Corporate Website Redesign", 
            "Redesign and modernize the Nova Smart Home e-commerce store. Build custom interactive product grids, optimize page flow, and integrate their smart device inventory API.", 
            "Active", 
            client1Id, 
            adminId
        ]);
        const p1Id = p1Res.rows[0].id;

        // Project 2
        const p2Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 days')
            RETURNING id
        `, [
            "Brand Identity System", 
            "Formulate a comprehensive visual brand guide, typography selection, custom color palettes, and social media templates for the new product launch.", 
            "Completed", 
            client1Id, 
            adminId
        ]);
        const p2Id = p2Res.rows[0].id;

        // Project 3
        const p3Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day')
            RETURNING id
        `, [
            "Client Portal Development", 
            "Design and implement a responsive client portal workspace with secure authentication, calendar widgets, and document collaboration features.", 
            "In Review", 
            client2Id, 
            adminId
        ]);
        const p3Id = p3Res.rows[0].id;

        // Project 4
        const p4Res = await pool.query(`
            INSERT INTO projects (title, description, status, client_id, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
            RETURNING id
        `, [
            "SEO Strategy & Audit", 
            "Perform comprehensive competitor keyword analysis and technical on-page SEO optimization for their financial blog network to increase organic search volume.", 
            "Planning", 
            client2Id, 
            adminId
        ]);
        const p4Id = p4Res.rows[0].id;

        // Insert Deliverables
        console.log("Inserting deliverables...");
        
        // Deliverable 1
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '10 days')
        `, [
            p1Id, 
            "Homepage Mockup.fig", 
            "High-fidelity Figma mockup for the desktop homepage layout, showcasing the new hero section and interactive product grid.", 
            "https://figma.com/file/homepage-mockup-nova", 
            adminId
        ]);

        // Deliverable 2
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '7 days')
        `, [
            p1Id, 
            "Launch Checklist.pdf", 
            "Comprehensive checklist covering final SEO settings, form verifications, SSL setup, and redirects planning.", 
            "https://docs.google.com/document/d/launch-checklist-nova", 
            adminId
        ]);

        // Deliverable 3
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '5 days')
        `, [
            p2Id, 
            "Brand Guidelines.pdf", 
            "Core typography instructions, color palettes, logo usage patterns, and visual asset templates.", 
            "https://docs.google.com/document/d/brand-guidelines-nova", 
            adminId
        ]);

        // Deliverable 4
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '3 days')
        `, [
            p3Id, 
            "Wireframes.pdf", 
            "UX wireframes detailing user dashboard views, navigation flows, and interactive page layouts.", 
            "https://docs.google.com/document/d/wireframes-aero", 
            adminId
        ]);

        // Deliverable 5
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '1 day')
        `, [
            p3Id, 
            "Design System.pdf", 
            "Comprehensive pattern library, reusable layout modules, and interactive elements definition.", 
            "https://docs.google.com/document/d/design-system-aero", 
            adminId
        ]);

        // Deliverable 6
        await pool.query(`
            INSERT INTO deliverables (project_id, title, description, file_url, uploaded_by, uploaded_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
            p4Id, 
            "SEO Audit Report.pdf", 
            "Detailed keyword gap analysis, competitor audit findings, and target schema recommendations.", 
            "https://docs.google.com/document/d/seo-audit-aero", 
            adminId
        ]);

        // Insert Comments
        console.log("Inserting comments...");

        // Project 1 Comments
        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '10 days')
        `, [
            p1Id, 
            client1Id, 
            "Hi Akansha, the Shopify store homepage layout looks stunning! Could we verify if the primary call-to-action has a hover state in the mockup?"
        ]);

        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '10 days' + INTERVAL '30 minutes')
        `, [
            p1Id, 
            adminId, 
            "Hi Sarah! Yes, we have added smooth hover transitions and custom color changes to all main buttons. You can preview them in the Homepage Mockup Figma link above."
        ]);

        // Project 2 Comments
        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '5 days')
        `, [
            p2Id, 
            client1Id, 
            "Thanks for sending over the brand identity guidelines. The typographic hierarchy and custom color palette are exactly what we envisioned."
        ]);

        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '5 days' + INTERVAL '2 hours')
        `, [
            p2Id, 
            adminId, 
            "Perfect! We've already exported the asset package with all logo variants and CSS color tokens for the development phase."
        ]);

        // Project 3 Comments
        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '2 days')
        `, [
            p3Id, 
            client2Id, 
            "Hi Akansha, could we review the latest dashboard portal layouts? The client onboarding flow looks extremely clean."
        ]);

        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '2 days' + INTERVAL '1 hour')
        `, [
            p3Id, 
            adminId, 
            "Hi Marcus! Yes, let's schedule a brief sync tomorrow at 10 AM to walk through the dashboard layouts and finalize the checkout screens."
        ]);

        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '1 day')
        `, [
            p3Id, 
            client2Id, 
            "Sounds perfect. I'll add our product manager to the invite list. See you then!"
        ]);

        // Project 4 Comments
        await pool.query(`
            INSERT INTO comments (project_id, user_id, message, created_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '4 hours')
        `, [
            p4Id, 
            adminId, 
            "Hi Marcus! I have uploaded the draft SEO Audit Report. It contains the key search queries and competitor analysis. Let me know what you think."
        ]);

        console.log("Database seeded successfully with realistic business profiles and active workspace data!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        pool.end();
    }
}

seed();
