import { Resume, ResumeSection } from "./types";
import ReactDOMServer from "react-dom/server";
import React from "react";

// ==========================================
// SHARED UTILS
// ==========================================
const getListItems = (sections: ResumeSection[], type: string) => {
  return sections
    .filter((s) => s.section_type === type)
    .flatMap((s) => s.content?.items || []);
};

const getThemeStyles = (color: string) => `
  :root { --primary: ${color}; }
  .text-primary { color: var(--primary); }
  .bg-primary { background-color: var(--primary); }
  .border-primary { border-color: var(--primary); }
  .hover\\:text-primary:hover { color: var(--primary); }
  .hover\\:bg-primary:hover { background-color: var(--primary); }
  .hover\\:border-primary:hover { border-color: var(--primary); }
  .ring-primary { --tw-ring-color: var(--primary); }
`;

// ==========================================
// TEMPLATE: MODERN
// ==========================================
const ModernTemplate = ({
  resume,
  sections,
}: {
  resume: Resume;
  sections: ResumeSection[];
}) => {
  const experience = getListItems(sections, "experience");
  const education = getListItems(sections, "education");
  const skills = getListItems(sections, "skills");
  const projects = getListItems(sections, "projects");

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">
            {resume.title || "My Portfolio"}
          </h1>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#about" className="hover:text-primary transition">
              About
            </a>
            {experience.length > 0 && (
              <a href="#experience" className="hover:text-primary transition">
                Experience
              </a>
            )}
            {projects.length > 0 && (
              <a href="#projects" className="hover:text-primary transition">
                Projects
              </a>
            )}
            <a href="#contact" className="hover:text-primary transition">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-20">
        {/* Hero */}
        <section id="about" className="text-center py-10">
          <div className="inline-block p-1 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mb-6">
            <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-white">
              <span>👋</span>
            </div>
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {resume.job_title || "Professional"}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Based in{" "}
            {resume.job_title?.includes("Developer")
              ? "the cloud"
              : "the world"}
            . Passionate about building great things.
          </p>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section id="skills">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold">Skills</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {skills.map((skill: any, i: number) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 font-medium text-gray-700 hover:border-primary hover:text-primary transition hover:-translate-y-1 transform duration-200"
                >
                  {typeof skill === "string" ? skill : skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section id="experience">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold">Experience</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-10 pl-8 pb-4">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-primary shadow-sm"></span>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                    <h4 className="text-xl font-bold text-gray-900">
                      {exp.title || exp.position || exp.role}
                    </h4>
                    <div className="text-primary font-medium mb-1">
                      {exp.company}
                    </div>
                    <p className="text-sm text-gray-400 mb-4 font-mono">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (if any) */}
        {projects.length > 0 && (
          <section id="projects">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold">Projects</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((proj: any, i: number) => (
                <div
                  key={i}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary/5 transition-colors">
                    <span className="text-4xl">💻</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {proj.title || "Project"}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {proj.description}
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                    >
                      View Project →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section
          id="contact"
          className="py-16 bg-gray-900 rounded-3xl text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            I'm currently available for freelance work or full-time
            opportunities.
          </p>
          <a
            href={`mailto:${resume.user_id}@example.com`}
            className="inline-block px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition transform hover:scale-105 active:scale-95"
          >
            Get in Touch
          </a>
        </section>
      </main>
    </div>
  );
};

// ==========================================
// TEMPLATE: PROFESSIONAL
// ==========================================
const ProfessionalTemplate = ({
  resume,
  sections,
}: {
  resume: Resume;
  sections: ResumeSection[];
}) => {
  const experience = getListItems(sections, "experience");
  const education = getListItems(sections, "education");
  const skills = getListItems(sections, "skills");

  return (
    <div className="bg-white min-h-screen font-serif text-gray-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-screen shadow-2xl">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-gray-50 border-r border-gray-200 p-8 md:fixed md:h-screen overflow-y-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {resume.title}
            </h1>
            <p className="text-primary font-medium uppercase tracking-widest text-sm">
              {resume.job_title}
            </p>
          </div>

          <nav className="space-y-4 mb-12 hidden md:block">
            <a
              href="#summary"
              className="block text-gray-600 hover:text-gray-900 font-medium"
            >
              Summary
            </a>
            <a
              href="#experience"
              className="block text-gray-600 hover:text-gray-900 font-medium"
            >
              Experience
            </a>
            <a
              href="#education"
              className="block text-gray-600 hover:text-gray-900 font-medium"
            >
              Education
            </a>
          </nav>

          {/* Contact Info in Sidebar */}
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary">
                ✉️
              </span>
              <span>contact@example.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary">
                📍
              </span>
              <span>New York, NY</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-80 p-8 md:p-16 bg-white">
          <section id="summary" className="mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
              Profile
            </h2>
            <p className="text-xl leading-relaxed text-gray-700">
              Experienced professional with a demonstrated history of working in
              the industry. Skilled in{" "}
              {skills?.[0]
                ? typeof skills[0] === "string"
                  ? skills[0]
                  : skills[0].name
                : "Management"}
              .
            </p>
          </section>

          {experience.length > 0 && (
            <section id="experience" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">
                Work History
              </h2>
              <div className="space-y-12">
                {experience.map((exp: any, i: number) => (
                  <div key={i} className="grid md:grid-cols-4 gap-4">
                    <div className="text-sm font-bold text-gray-500 pt-1">
                      {exp.startDate} - {exp.endDate}
                    </div>
                    <div className="md:col-span-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title || exp.position || exp.role}
                      </h3>
                      <div className="text-primary font-medium mb-4">
                        {exp.company}
                      </div>
                      <p className="text-gray-600 whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section id="education" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">
                Education
              </h2>
              <div className="space-y-8">
                {education.map((edu: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary pl-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {edu.degree}
                    </h3>
                    <div className="text-gray-600">{edu.school}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {edu.graduationDate}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE: CREATIVE
// ==========================================
const CreativeTemplate = ({
  resume,
  sections,
}: {
  resume: Resume;
  sections: ResumeSection[];
}) => {
  const experience = getListItems(sections, "experience");
  const projects = getListItems(sections, "projects");
  const skills = getListItems(sections, "skills");

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-32 min-h-[60vh] flex flex-col justify-center">
          <div className="opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono mb-4 text-lg">
              Hello, I'm
            </p>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6 leading-none">
              {resume.title?.split(" ")[0] || "CREATIVE"}
              <span className="text-purple-500">.</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-light text-slate-400 max-w-2xl">
              {resume.job_title}
            </h2>
          </div>

          <div className="mt-12 flex gap-4 opacity-0 animate-[slideUp_1s_ease-out_0.5s_forwards]">
            {resume.user_id && (
              <a
                href={`mailto:contact@example.com`}
                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-purple-50 transition hover:scale-105 active:scale-95"
              >
                Contact Me
              </a>
            )}
            <a
              href="#work"
              className="px-8 py-3 border border-slate-700 text-white font-medium rounded-full hover:bg-slate-800 transition"
            >
              View Work
            </a>
          </div>
        </header>

        <main className="space-y-32">
          {/* Skills Ticker */}
          {skills.length > 0 && (
            <div className="w-full overflow-hidden py-10 border-y border-slate-800/50">
              <div className="flex gap-8 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-8">
                    {skills.map((skill: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-4xl font-bold text-slate-700 uppercase"
                      >
                        {typeof skill === "string" ? skill : skill.name} •
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work / Projects */}
          <section id="work">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16">
              / Selected Works
            </h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
              {(projects.length > 0 ? projects : experience).map(
                (item: any, index: number) => (
                  <div
                    key={index}
                    className={`group ${index % 2 === 1 ? "md:mt-24" : ""}`}
                  >
                    <div className="bg-slate-800/50 aspect-[4/3] rounded-3xl mb-8 overflow-hidden relative border border-slate-700/50 group-hover:border-purple-500/50 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500">
                          {index % 3 === 0
                            ? "🎨"
                            : index % 3 === 1
                            ? "💻"
                            : "📱"}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-3xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                      {item.title || item.role}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-sm font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      View Case Study <span className="ml-2">→</span>
                    </a>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Experience List */}
          {experience.length > 0 && (
            <section className="max-w-3xl mx-auto">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16 text-center">
                / Career History
              </h3>
              <div className="space-y-12">
                {experience.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="relative pl-8 border-l border-slate-800"
                  >
                    <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                      <h4 className="text-2xl font-bold text-white">
                        {exp.company}
                      </h4>
                      <span className="font-mono text-sm text-slate-500">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </span>
                    </div>
                    <div className="text-lg text-purple-300 mb-4">
                      {exp.title || exp.position || exp.role}
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="mt-32 pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} {resume.title}
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white transition">
              GitHub
            </a>
          </div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
           from { opacity: 0; }
           to { opacity: 1; }
        }
        @keyframes slideUp {
           from { opacity: 0; transform: translateY(20px); }
           to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
    </div>
  );
};

// ==========================================
// TEMPLATE: MINIMALIST
// ==========================================
const MinimalistTemplate = ({
  resume,
  sections,
  settings,
}: {
  resume: Resume;
  sections: ResumeSection[];
  settings?: any;
}) => {
  const experience = getListItems(sections, "experience");
  const education = getListItems(sections, "education");
  const skills = getListItems(sections, "skills");
  const projects = getListItems(sections, "projects");

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          {settings?.showPhoto && (settings?.photoUrl || resume.user_id) && (
            <img
              src={settings?.photoUrl || "https://via.placeholder.com/150"}
              className="w-32 h-32 rounded-full mx-auto mb-6 object-cover grayscale"
              alt="Profile"
            />
          )}
          <h1 className="text-4xl font-light tracking-wide uppercase mb-4">
            {resume.title}
          </h1>
          <p className="text-gray-500 tracking-widest text-sm uppercase">
            {resume.job_title}
          </p>
        </header>

        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("skills")) &&
          skills.length > 0 && (
            <section className="mb-16 text-center">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {skills.map((skill: any, i: number) => (
                  <span
                    key={i}
                    className="text-sm text-gray-600 border-b border-transparent hover:border-gray-900 transition-colors cursor-default"
                  >
                    {typeof skill === "string" ? skill : skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("experience")) &&
          experience.length > 0 && (
            <section className="mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-4 mb-8">
                Experience
              </h2>
              <div className="space-y-12">
                {experience.map((exp: any, i: number) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-lg font-medium">{exp.company}</h3>
                      <span className="text-xs text-gray-400 font-mono">
                        {exp.startDate} — {exp.endDate}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2 italic">
                      {exp.title || exp.position}
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("projects")) &&
          projects.length > 0 && (
            <section className="mb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 pb-4 mb-8">
                Selected Work
              </h2>
              <div className="grid gap-8">
                {projects.map((proj: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-lg font-medium mb-1 hover:underline cursor-pointer">
                      {proj.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE: GRID (Masonry)
// ==========================================
const GridTemplate = ({
  resume,
  sections,
  settings,
}: {
  resume: Resume;
  sections: ResumeSection[];
  settings?: any;
}) => {
  const experience = getListItems(sections, "experience");
  const projects = getListItems(sections, "projects");
  const skills = getListItems(sections, "skills");

  return (
    <div className="bg-stone-100 min-h-screen text-stone-900 p-4 md:p-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(100px,auto)] max-w-7xl mx-auto">
        {/* Intro Card */}
        <div className="col-span-1 md:col-span-2 row-span-2 bg-stone-900 text-white p-8 rounded-3xl flex flex-col justify-between">
          <div>
            {settings?.showPhoto && (
              <img
                src={settings?.photoUrl || "https://via.placeholder.com/150"}
                className="w-16 h-16 rounded-full border-2 border-white/20 mb-6 object-cover"
              />
            )}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {resume.title}
            </h1>
            <p className="text-stone-400 text-lg">{resume.job_title}</p>
          </div>
          <div className="flex gap-4 mt-8">
            <button className="px-6 py-2 bg-white text-stone-900 rounded-full font-bold hover:bg-stone-200 transaction">
              Resume
            </button>
            <button className="px-6 py-2 border border-stone-600 text-white rounded-full font-bold hover:bg-stone-800 transaction">
              Contact
            </button>
          </div>
        </div>

        {/* Skills Card */}
        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("skills")) &&
          skills.length > 0 && (
            <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill: any, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-stone-100 rounded-md text-xs font-semibold text-stone-600"
                  >
                    {typeof skill === "string" ? skill : skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Experience Cards */}
        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("experience")) &&
          experience.map((exp: any, i: number) => (
            <div
              key={i}
              className={`col-span-1 md:col-span-2 bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow ${
                i === 0 ? "md:row-span-2" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl">{exp.company}</h3>
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  {exp.startDate}
                </span>
              </div>
              <p className="text-stone-500 font-medium mb-4">{exp.title}</p>
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-4">
                {exp.description}
              </p>
            </div>
          ))}

        {/* Project Cards */}
        {(settings?.visibleSections === undefined ||
          settings?.visibleSections?.includes("projects")) &&
          projects.map((proj: any, i: number) => (
            <div
              key={i}
              className="col-span-1 bg-orange-500 text-white p-6 rounded-3xl shadow-sm hover:bg-orange-600 transition-colors"
            >
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center mb-4 text-xl">
                🚀
              </div>
              <h3 className="font-bold text-lg mb-2">{proj.title}</h3>
              <p className="text-orange-100 text-xs line-clamp-3">
                {proj.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE: GLASS (Dark Mode)
// ==========================================
const GlassTemplate = ({
  resume,
  sections,
  settings,
}: {
  resume: Resume;
  sections: ResumeSection[];
  settings?: any;
}) => {
  const experience = getListItems(sections, "experience");
  const projects = getListItems(sections, "projects");
  const skills = getListItems(sections, "skills");

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden relative">
      {/* Abstract Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          {settings?.showPhoto && (
            <img
              src={settings?.photoUrl || "https://via.placeholder.com/150"}
              className="w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-lg"
            />
          )}
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200">
              {resume.title}
            </h1>
            <p className="text-xl text-white/70 font-light">
              {resume.job_title}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            {(settings?.visibleSections === undefined ||
              settings?.visibleSections?.includes("skills")) && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 text-blue-300">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs hover:bg-white/20 transition"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {(settings?.visibleSections === undefined ||
              settings?.visibleSections?.includes("experience")) &&
              experience.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-pink-300">
                    Experience
                  </h2>
                  <div className="space-y-8">
                    {experience.map((exp: any, i: number) => (
                      <div
                        key={i}
                        className="border-l-2 border-white/10 pl-6 relative"
                      >
                        <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
                        <h3 className="text-xl font-bold">{exp.company}</h3>
                        <p className="text-white/50 text-sm mb-2">
                          {exp.title} | {exp.startDate}
                        </p>
                        <p className="text-white/80 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {(settings?.visibleSections === undefined ||
              settings?.visibleSections?.includes("projects")) &&
              projects.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 text-blue-300">
                    Projects
                  </h2>
                  <div className="grid gap-4">
                    {projects.map((proj: any, i: number) => (
                      <div
                        key={i}
                        className="bg-black/20 p-4 rounded-xl hover:bg-black/40 transition"
                      >
                        <h3 className="font-bold text-lg mb-1">{proj.title}</h3>
                        <p className="text-white/60 text-sm">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN GENERATOR
// ==========================================
export const generatePortfolioHTML = (
  resume: Resume,
  sections: ResumeSection[],
  templateId: string = "modern",
  settings: any = {}
) => {
  let TemplateComponent;

  switch (templateId) {
    case "professional":
      TemplateComponent = ProfessionalTemplate;
      break;
    case "creative":
      TemplateComponent = CreativeTemplate;
      break;
    case "minimalist":
      TemplateComponent = MinimalistTemplate;
      break;
    case "grid":
      TemplateComponent = GridTemplate;
      break;
    case "glass":
      TemplateComponent = GlassTemplate;
      break;
    case "modern":
    default:
      TemplateComponent = ModernTemplate;
      break;
  }

  const themeColor = settings.color || resume.theme_color || "#2563EB";

  const html = ReactDOMServer.renderToStaticMarkup(
    <TemplateComponent
      resume={resume}
      sections={sections}
      settings={settings}
    />
  );

  return `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${settings.customTitle || resume.title} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>
    ${getThemeStyles(themeColor)}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
};

// ==========================================
// RENDERER COMPONENT (For Live Preview)
// ==========================================
export const PortfolioRenderer = ({
  resume,
  sections,
  template,
  settings = {},
}: {
  resume: Resume;
  sections: ResumeSection[];
  template: string;
  settings?: any;
}) => {
  let TemplateComponent;

  switch (template) {
    case "glass":
      TemplateComponent = GlassTemplate;
      break;
    case "modern":
    default:
      TemplateComponent = ModernTemplate;
      break;
  }

  // Inject styles for preview
  const themeColor = settings.color || resume.theme_color || "#2563EB";

  return (
    <div className="portfolio-preview-root h-full overflow-y-auto bg-white">
      <style>{getThemeStyles(themeColor)}</style>
      <TemplateComponent
        resume={resume}
        sections={sections}
        settings={settings}
      />
    </div>
  );
};
