export interface SectionData {
    title: string;
    body: string;
    x: number;
    z: number;
    projects?: { title: string; desc: string; code?: string; preview?: string }[];
}

export const PORTFOLIO_DATA: Record<string, SectionData> = {
    'about': {
        title: "ABOUT ME",
        body: "Full Stack Developer with 1.5 years of experience developing modern web applications using React, Next.js, and TypeScript. On the backend, I’ve worked with Node.js, ExpressJs, NestJS, Go, Java (Spring Boot), and Python to design scalable APIs and backend services. I’m passionate about building performant systems, improving developer experience, and delivering production-ready software.",
        x: -15, z: -10
    },
    'skills': {
        title: "SKILLS",
        body: "Programming Languages: JavaScript, TypeScript, Java, Python, Go, SQL, NoSQL.\n\nFrameworks & Libraries: React.js, Next.js, Express.js, Nest.js, Spring Boot, Flask, Tailwind.\n\nDatabases & ORMs: PostgreSQL, MySQL, MongoDB, Prisma, Hibernate, JPA.\n\nTools: Git, GitHub, GitHub Actions, Docker, Playwright.\n\nRuntime Environment: Node.js",
        x: -5, z: -10,
    },
    'projects': {
        title: "PROJECTS LINKS",
        body: "Look up! Detailed projects are in the sky. Links are inside this cabin.",
        projects: [
            { title: "Mo Programming Language", desc: "As an experimental graduation project, I built a custom dynamically typed programming language from the ground up, motivated by a deep curiosity about how programming languages work beneath the surface. Through this project, I explored language design by defining the grammar and implementing a parser with nearley.js to generate an Abstract Syntax Tree (AST), then translating that structure into optimized, executable JavaScript via a custom-built transpiler compatible with the Node.js runtime. The experience gave me hands-on insight into the full lifecycle of a programming language, from syntax design to execution.", code: "https://github.com/Mohammad-y-abbass/mo-programming-language" },
            { title: "Job Matching Agent", desc: "I built a personal automated job-matching tool to save time filtering through irrelevant postings. It scrapes job listings in parallel from ~10 different websites, reducing total scrape time, then extracts and cleans job titles and descriptions. Each job is embedded using a Sentence-Transformers model (all-MiniLM-L6-v2) and matched against my resume using cosine similarity, allowing semantic comparison instead of simple keyword rules. The system maintains history to avoid reprocessing seen jobs and continuously surfaces the most relevant opportunities based on actual role requirements and experience alignment.", code: "https://github.com/Mohammad-y-abbass/job-match-agent" },
            { title: "Rapid Express", desc: "Engineered a globally-installed CLI tool to automate Express.js app scaffolding, enabling rapid generation of production-ready APIs with a single command. Designed a scalable folder architecture with built-in decorators and error-handling middleware, reducing initial developer setup time by 70%, and published it on npm, achieving 1,200+ downloads and providing a valuable resource for the developer community.", preview: "https://www.npmjs.com/package/@mohammad-abbass/rapid-express", code: "https://github.com/Mohammad-y-abbass/rapid-express" },
            { title: "Online JavaScript Code Editor", desc: "Built an online JavaScript code editor using TypeScript and Monaco Editor, integrating Prettier for real-time code formatting and esbuild for fast bundling. Enabled package imports with caching for improved performance, and developed a custom esbuild plugin to seamlessly redirect npm package imports to unpkg, creating a fully-featured, browser-based development environment.", code: "https://github.com/Mohammad-y-abbass/code-editor" }
        ],
        x: 5, z: -10
    },
    'experience': {
        title: "EXPERIENCE",
        body: "Frontend Developer\nVertex Partners |  4/2025 - 10/2025\n\nFullstack Developer Volunteer\nBig Data Specialist | 8/2024 - present\n\nFullstack Developer Intern\n3E Tech | 1/2025 - 4/2025\n\nSoftware Developer Intern\nBracket Technologies | 5/2024 - 8/2024",
        x: 15, z: -10
    },
    'contact': {
        title: "CONTACT ME",
        body: "Email: mhmd.y.abbass@gmail.com\nGitHub: github.com/Mohammad-y-abbass\nLinkedIn: linkedin.com/in/mohammad-abbass/",
        x: 25, z: -10
    }
};
