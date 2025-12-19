import { Resume, ResumeSection } from "./types";
import ReactDOMServer from "react-dom/server";
import React from "react";

// ==========================================
// SHARED UTILS
// ==========================================
const getListItems = (sections: ResumeSection[], type: string) => {
  return sections
    .filter((s) => s.section_type === type)
    .flatMap((s) => {
      if (Array.isArray(s.content)) return s.content;
      if (s.content?.items && Array.isArray(s.content.items))
        return s.content.items;
      if (s.content && typeof s.content === "object" && !s.content.items) {
        // fallback if it's a single object but treated as a section that might list things?
        // rarely happens for list types, but safety check.
        return [];
      }
      return [];
    });
};

const getPersonalInfo = (sections: ResumeSection[]) => {
  const section = sections.find((s) => s.section_type === "personal_info");
  return section?.content || section?.section_data || {};
};

const getSummary = (sections: ResumeSection[]) => {
  const section = sections.find((s) => s.section_type === "summary");
  const data = section?.content || section?.section_data;
  if (typeof data === "string") return data;
  return data?.text || "";
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
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const certifications = getListItems(sections, "certifications");
  const custom = getListItems(sections, "custom");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">
            {personalInfo.name || resume.title || "My Portfolio"}
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
            {education.length > 0 && (
              <a href="#education" className="hover:text-primary transition">
                Education
              </a>
            )}
            {certifications.length > 0 && (
              <a
                href="#certifications"
                className="hover:text-primary transition"
              >
                Certificates
              </a>
            )}
            {custom.length > 0 && (
              <a href="#custom" className="hover:text-primary transition">
                More
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
          <div className="inline-block p-1 rounded-full bg-gradient-to-tr from-primary to-purple-500 mb-6">
            <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-white">
              {personalInfo.photoUrl ? (
                <img
                  src={personalInfo.photoUrl}
                  alt={personalInfo.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>👋</span>
              )}
            </div>
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {personalInfo.name || "Professional"}
          </h2>
          <p className="text-2xl text-primary font-bold mb-6">
            {personalInfo.jobTitle || resume.job_title}
          </p>
          {summary && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed italic">
              "{summary}"
            </p>
          )}

          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
              >
                <span>📧</span> {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>📱</span> {personalInfo.phone}
              </div>
            )}
            {personalInfo.city && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>📍</span> {personalInfo.city}, {personalInfo.country}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6 mt-6">
            {personalInfo.linkedin && (
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-primary transition-colors text-xl"
              >
                LinkedIn
              </a>
            )}
            {personalInfo.github && (
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-primary transition-colors text-xl"
              >
                GitHub
              </a>
            )}
          </div>
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <section id="certifications">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold">Certifications</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <h4 className="font-bold text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-primary font-medium">
                    {cert.issuer}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{cert.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Section */}
        {custom.length > 0 && (
          <section id="custom">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-2xl font-bold">Additional Info</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <div className="space-y-6">
              {custom.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <div className="text-gray-600 text-sm">
                    {item.description}
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
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const projects = getListItems(sections, "projects");
  const certifications = getListItems(sections, "certifications");
  const custom = getListItems(sections, "custom");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-white min-h-screen font-serif text-gray-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-screen shadow-2xl">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-gray-50 border-r border-gray-200 p-8 md:fixed md:h-screen overflow-y-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {personalInfo.name || resume.title}
            </h1>
            <p className="text-primary font-medium uppercase tracking-widest text-sm mb-6">
              {personalInfo.jobTitle || resume.job_title}
            </p>
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                className="w-32 h-32 rounded-xl object-cover mb-6 shadow-md"
                alt="Avatar"
              />
            )}
          </div>

          <nav className="space-y-4 mb-12 hidden md:block">
            {summary && (
              <a
                href="#summary"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Profile
              </a>
            )}
            {experience.length > 0 && (
              <a
                href="#experience"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Experience
              </a>
            )}
            {education.length > 0 && (
              <a
                href="#education"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Education
              </a>
            )}
            {achievements.length > 0 && (
              <a
                href="#achievements"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Achievements
              </a>
            )}
            {projects.length > 0 && (
              <a
                href="#projects"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Projects
              </a>
            )}
            {certifications.length > 0 && (
              <a
                href="#certifications"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Certificates
              </a>
            )}
            {custom.length > 0 && (
              <a
                href="#custom"
                className="block text-gray-600 hover:text-gray-900 font-medium text-sm uppercase tracking-wide"
              >
                Additional Info
              </a>
            )}
          </nav>

          {/* Contact Info */}
          <div className="space-y-6 text-sm text-gray-600 mb-12">
            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">
              Contact
            </h3>
            {personalInfo.email && (
              <div className="flex items-center gap-3">
                <span className="text-primary">✉️</span>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-3">
                <span className="text-primary">📱</span>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.city && (
              <div className="flex items-center gap-3">
                <span className="text-primary">📍</span>
                <span>
                  {personalInfo.city}, {personalInfo.country}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  className="text-xs text-primary hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  className="text-xs text-primary hover:underline"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">
                Languages
              </h3>
              {languages.map((lang: any, i: number) => (
                <div key={i} className="text-sm">
                  <div className="font-medium text-gray-800">
                    {lang.language}
                  </div>
                  <div className="text-gray-500 text-xs italic">
                    {lang.proficiency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-80 p-8 md:p-16 bg-white">
          {summary && (
            <section id="summary" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 pb-2 border-b">
                Profile
              </h2>
              <div className="text-xl leading-relaxed text-gray-700 italic border-l-4 border-primary/20 pl-6 py-2">
                {summary}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section id="experience" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 pb-2 border-b">
                Work History
              </h2>
              <div className="space-y-12">
                {experience.map((exp: any, i: number) => (
                  <div key={i} className="grid md:grid-cols-4 gap-4">
                    <div className="text-sm font-bold text-gray-500 pt-1">
                      {exp.startDate} - {exp.endDate}
                    </div>
                    <div className="md:col-span-3">
                      <h3 className="text-xl font-bold text-gray-900 focus-within:text-primary transition-colors">
                        {exp.title || exp.position || exp.role}
                      </h3>
                      <div className="text-primary font-medium mb-4">
                        {exp.company}
                      </div>
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">
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
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 pb-2 border-b">
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

          {achievements.length > 0 && (
            <section
              id="achievements"
              className="mb-16 text-slate-900 bg-slate-50 p-8 rounded-2xl border border-slate-100"
            >
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
                Honors & Awards
              </h2>
              <div className="space-y-8">
                {achievements.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl pt-1">🏆</div>
                    <div>
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="text-sm text-slate-500 mb-1">{item.date}</p>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section id="projects" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 pb-2 border-b">
                Featured Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {projects.map((proj: any, i: number) => (
                  <div key={i} className="group">
                    <div className="h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-3xl group-hover:bg-primary/5 transition-colors">
                      🚀
                    </div>
                    <h3 className="text-xl font-bold mb-2">{proj.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {proj.description}
                    </p>
                    <a
                      href="#"
                      className="text-primary text-sm font-bold hover:underline"
                    >
                      Case Study →
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section id="certifications" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 pb-2 border-b">
                Certifications
              </h2>
              <div className="space-y-6">
                {certifications.map((cert: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-baseline border-b border-gray-50 pb-4"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900">{cert.name}</h3>
                      <div className="text-primary text-sm">{cert.issuer}</div>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      {cert.date}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {custom.length > 0 && (
            <section id="custom" className="mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 pb-2 border-b">
                Additional Information
              </h2>
              <div className="space-y-10">
                {custom.map((item: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-6">
                      {item.description}
                    </p>
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
  const education = getListItems(sections, "education");
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const certifications = getListItems(sections, "certifications");
  const custom = getListItems(sections, "custom");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-scroll { animation: scroll 20s linear infinite; }
      `}</style>

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-32 min-h-[60vh] flex flex-col justify-center relative">
          {personalInfo.photoUrl && (
            <div className="mb-12 opacity-0 animate-fadeIn">
              <img
                src={personalInfo.photoUrl}
                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-purple-500/30 rotate-3 hover:rotate-0 transition-transform duration-500"
                alt="Avatar"
              />
            </div>
          )}
          <div
            className="opacity-0 animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono mb-4 text-lg">
              Hello, I'm
            </p>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6 leading-none">
              {(personalInfo.name || resume.title || "CREATIVE").split(" ")[0]}
              <span className="text-purple-500">.</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-light text-slate-400 max-w-2xl">
              {personalInfo.jobTitle || resume.job_title}
            </h2>
          </div>

          <div
            className="mt-12 flex flex-wrap gap-4 opacity-0 animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-purple-50 transition hover:scale-105 active:scale-95"
              >
                Let's Talk
              </a>
            )}
            <div className="flex gap-4 items-center pl-4">
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>

          {summary && (
            <div
              className="mt-16 max-w-2xl opacity-0 animate-fadeIn"
              style={{ animationDelay: "0.6s" }}
            >
              <p className="text-xl text-slate-400 leading-relaxed font-light">
                {summary}
              </p>
            </div>
          )}
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

          {/* Projects */}
          {projects.length > 0 && (
            <section id="work">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16">
                / Selected Works
              </h3>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-24">
                {projects.map((item: any, index: number) => (
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
                      {item.title}
                    </h4>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center text-sm font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      View Project <span className="ml-2">→</span>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section className="mt-40">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16">
                / Experience
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
                      {exp.title}
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="mt-32">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16 text-center">
                / Education
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {education.map((edu: any, i: number) => (
                  <div
                    key={i}
                    className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50"
                  >
                    <h4 className="text-xl font-bold text-white mb-2">
                      {edu.degree}
                    </h4>
                    <p className="text-purple-400 mb-2">{edu.school}</p>
                    <p className="text-slate-500 text-sm font-mono">
                      {edu.graduationDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements & Languages */}
          <div className="grid md:grid-cols-2 gap-20 mt-32">
            {achievements.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-12">
                  / Recognitions
                </h3>
                <div className="space-y-8">
                  {achievements.map((item: any, i: number) => (
                    <div key={i} className="group">
                      <div className="text-slate-500 font-mono text-xs mb-1 group-hover:text-purple-400 transition-colors">
                        {item.date}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {languages.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-12">
                  / Languages
                </h3>
                <div className="space-y-6">
                  {languages.map((lang: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xl font-bold text-white">
                          {lang.language}
                        </span>
                        <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                          {lang.proficiency}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{
                            width:
                              lang.proficiency === "Native"
                                ? "100%"
                                : lang.proficiency === "Fluent"
                                ? "90%"
                                : "60%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {certifications.length > 0 && (
            <section className="mt-32">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-12">
                / Certifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {certifications.map((cert: any, i: number) => (
                  <div
                    key={i}
                    className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/30 hover:bg-slate-800/40 transition"
                  >
                    <h4 className="text-lg font-bold text-white mb-1">
                      {cert.name}
                    </h4>
                    <p className="text-purple-400 text-sm">{cert.issuer}</p>
                    <p className="text-slate-500 text-xs font-mono mt-4">
                      {cert.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {custom.length > 0 && (
            <section className="mt-40">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400 mb-16">
                / Extra Bits
              </h3>
              <div className="grid md:grid-cols-2 gap-16">
                {custom.map((item: any, i: number) => (
                  <div key={i} className="group">
                    <div className="text-purple-500 font-mono text-xs mb-4">
                      0{i + 1} —
                    </div>
                    <h4 className="text-3xl font-bold text-white mb-6 group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                      {item.title}
                    </h4>
                    <div className="text-slate-400 text-lg leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="mt-32 pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            {personalInfo.name || resume.title}
          </div>
          <div className="flex gap-6">
            {personalInfo.linkedin && (
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>
            )}
            {personalInfo.github && (
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
            )}
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="hover:text-white transition"
              >
                Email
              </a>
            )}
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
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const certifications = getListItems(sections, "certifications");
  const custom = getListItems(sections, "custom");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        <header className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-5xl font-light tracking-tight mb-4">
                {personalInfo.name || resume.title}
              </h1>
              <p className="text-gray-400 tracking-[0.3em] text-xs uppercase">
                {personalInfo.jobTitle || resume.job_title}
              </p>
            </div>
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                className="w-24 h-24 rounded-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
                alt="Profile"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-400 font-light">
            <div className="space-y-1">
              {personalInfo.email && (
                <p className="hover:text-gray-900 transition-colors pointer-events-auto cursor-pointer">
                  {personalInfo.email}
                </p>
              )}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.city && (
                <p>
                  {personalInfo.city}, {personalInfo.country}
                </p>
              )}
            </div>
            <div className="md:text-right space-y-1">
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-gray-900"
                >
                  LinkedIn
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-gray-900"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </header>

        {summary && (
          <section className="mb-24">
            <div className="max-w-xl">
              <p className="text-xl leading-relaxed text-gray-600 font-light">
                {summary}
              </p>
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-24">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-8">
              Expertise
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12">
              {skills.slice(0, 9).map((skill: any, i: number) => (
                <div
                  key={i}
                  className="text-sm border-l border-gray-100 pl-4 py-1 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all cursor-default"
                >
                  {typeof skill === "string" ? skill : skill.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-24">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
              Career Path
            </h2>
            <div className="space-y-16">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4">
                    <h3 className="text-xl font-normal group-hover:italic transition-all">
                      {exp.company}
                    </h3>
                    <span className="text-[10px] text-gray-300 font-mono md:ml-auto">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">
                    {exp.title || exp.position}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl font-light">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-24">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
              Experiments
            </h2>
            <div className="grid gap-12">
              {projects.map((proj: any, i: number) => (
                <div key={i} className="group cursor-pointer">
                  <h3 className="text-lg font-normal mb-2 border-b border-transparent group-hover:border-gray-900 inline-block transition-all">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-light">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {education.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
                Education
              </h2>
              <div className="space-y-8">
                {education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h4 className="text-sm font-medium mb-1">{edu.degree}</h4>
                    <p className="text-xs text-gray-500 font-light">
                      {edu.school}
                    </p>
                    <p className="text-[10px] text-gray-300 font-mono mt-2">
                      {edu.graduationDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div>
            {achievements.length > 0 && (
              <section className="mb-16">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
                  Notice
                </h2>
                <div className="space-y-6 text-sm text-gray-500 font-light">
                  {achievements.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-gray-200">/</span>
                      <p>{item.title}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {languages.length > 0 && (
              <section className="mb-16">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
                  Voice
                </h2>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {languages.map((lang: any, i: number) => (
                    <div key={i}>
                      <div className="text-sm font-medium">{lang.language}</div>
                      <div className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">
                        {lang.proficiency}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="mb-16">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
                  Proof
                </h2>
                <div className="space-y-6">
                  {certifications.map((cert: any, i: number) => (
                    <div key={i}>
                      <h4 className="text-sm font-medium mb-1">{cert.name}</h4>
                      <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                        {cert.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {custom.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-12">
                  Misc
                </h2>
                <div className="space-y-8">
                  {custom.map((item: any, i: number) => (
                    <div key={i}>
                      <h4 className="text-sm font-medium mb-2 uppercase tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="mt-48 pt-12 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-300 font-mono uppercase tracking-[0.2em]">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            {personalInfo.name || resume.title}
          </div>
          <a href="#top" className="hover:text-gray-900 transition-colors">
            Top
          </a>
        </footer>
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
  const education = getListItems(sections, "education");
  const projects = getListItems(sections, "projects");
  const skills = getListItems(sections, "skills");
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-stone-100 min-h-screen text-stone-900 p-4 md:p-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(100px,auto)] max-w-7xl mx-auto">
        {/* Intro Card */}
        <div className="col-span-1 md:col-span-2 row-span-2 bg-stone-900 text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              {personalInfo.photoUrl && (
                <img
                  src={personalInfo.photoUrl}
                  className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
                  alt="Avatar"
                />
              )}
              {personalInfo.email && (
                <div className="text-stone-400 text-xs font-mono uppercase tracking-widest">
                  {personalInfo.email}
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {personalInfo.name || resume.title}
            </h1>
            <p className="text-stone-400 text-lg mb-6">
              {personalInfo.jobTitle || resume.job_title}
            </p>
            {summary && (
              <p className="text-stone-300 font-light leading-relaxed max-w-md line-clamp-3 italic">
                "{summary}"
              </p>
            )}
          </div>
          <div className="flex gap-4 mt-8 relative z-10">
            {personalInfo.email && (
              <a
                href={`mailto:${personalInfo.email}`}
                className="px-6 py-2 bg-white text-stone-900 rounded-full font-bold hover:bg-stone-200 transition text-sm"
              >
                Get in Touch
              </a>
            )}
            <div className="flex gap-4 items-center ml-4">
              {personalInfo.linkedin && (
                <a
                  href={personalInfo.linkedin}
                  className="text-stone-400 hover:text-white transition"
                >
                  LN
                </a>
              )}
              {personalInfo.github && (
                <a
                  href={personalInfo.github}
                  className="text-stone-400 hover:text-white transition"
                >
                  GH
                </a>
              )}
            </div>
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
  const education = getListItems(sections, "education");
  const projects = getListItems(sections, "projects");
  const skills = getListItems(sections, "skills");
  const languages = getListItems(sections, "languages");
  const achievements = getListItems(sections, "achievements");
  const personalInfo = getPersonalInfo(sections);
  const summary = getSummary(sections);

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden relative">
      {/* Abstract Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              className="w-32 h-32 rounded-2xl border-2 border-white/20 object-cover shadow-2xl relative z-10"
              alt="Avatar"
            />
          )}
          <div className="text-center md:text-left relative z-10">
            <h1 className="text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200">
              {personalInfo.name || resume.title}
            </h1>
            <p className="text-xl text-white/70 font-light mb-4">
              {personalInfo.jobTitle || resume.job_title}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono text-white/40">
              {personalInfo.email && (
                <span className="flex items-center gap-1">
                  ✉️ {personalInfo.email}
                </span>
              )}
              {personalInfo.city && (
                <span className="flex items-center gap-1">
                  📍 {personalInfo.city}
                </span>
              )}
              <div className="flex gap-3">
                {personalInfo.linkedin && (
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition"
                  >
                    LN
                  </a>
                )}
                {personalInfo.github && (
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition"
                  >
                    GH
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            {summary && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-primary">
                  About
                </h3>
                <p className="text-sm text-white/60 leading-relaxed italic font-light">
                  "{summary}"
                </p>
              </div>
            )}

            {(settings?.visibleSections === undefined ||
              settings?.visibleSections?.includes("skills")) && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-primary">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono hover:bg-white/10 transition border border-white/5"
                    >
                      {typeof skill === "string" ? skill : skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-primary">
                  Languages
                </h3>
                <div className="space-y-3">
                  {languages.map((lang: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-white/80">{lang.language}</span>
                      <span className="text-white/30">{lang.proficiency}</span>
                    </div>
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
                  <h2 className="text-2xl font-bold mb-6 text-primary">
                    Selected Work
                  </h2>
                  <div className="grid gap-6">
                    {projects.map((proj: any, i: number) => (
                      <div
                        key={i}
                        className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition border border-white/5 group"
                      >
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                          {proj.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                          {proj.description}
                        </p>
                        {proj.technologies && (
                          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                            {proj.technologies}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {education.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  Education
                </h2>
                <div className="grid gap-6">
                  {education.map((edu: any, i: number) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:justify-between gap-2 border-b border-white/5 pb-4 last:border-0"
                    >
                      <div>
                        <h4 className="font-bold text-lg">{edu.degree}</h4>
                        <p className="text-white/60 text-sm">{edu.school}</p>
                      </div>
                      <div className="text-[10px] font-mono text-white/30 uppercase pt-2">
                        {edu.graduationDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-primary/20 to-pink-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                  >
                    <span className="text-2xl mb-4 block">✨</span>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-[10px] uppercase text-white/40 mb-3">
                      {item.date}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
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
    case "professional":
      TemplateComponent = ProfessionalTemplate;
      break;
    case "minimal":
      TemplateComponent = MinimalistTemplate;
      break;
    case "creative":
      TemplateComponent = CreativeTemplate;
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
    case "professional":
      TemplateComponent = ProfessionalTemplate;
      break;
    case "minimal":
      TemplateComponent = MinimalistTemplate;
      break;
    case "creative":
      TemplateComponent = CreativeTemplate;
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

  // Inject styles for preview
  const themeColor =
    settings.themeColor || settings.color || resume.theme_color || "#2563EB";

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
