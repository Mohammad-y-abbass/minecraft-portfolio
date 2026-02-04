export interface SectionData {
    title: string;
    body: string;
    x: number;
    z: number;
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
        title: "PROJECTS",
        body: "Minecraft Portfolio - A 3D immersive world built with Three.js and Vite.",
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
