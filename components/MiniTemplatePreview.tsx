import React from "react";

export const MiniTemplatePreview = ({
  templateId,
  color,
}: {
  templateId: string;
  color: string;
}) => {
  // Determine layout based on template ID
  const isSidebarLeft = [
    "modern",
    "creative",
    "timeline",
    "modern-ats",
    "creative-ats",
    "vibrant-creative",
  ].includes(templateId);
  const isSidebarRight = ["tech", "bold"].includes(templateId);
  const isGrid = ["grid", "compact", "dense", "geometric-creative"].includes(
    templateId,
  );

  const accentStyle = { backgroundColor: color };
  const lightAccentStyle = { backgroundColor: color, opacity: 0.1 };
  const textAccentStyle = { backgroundColor: color, opacity: 0.4 };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative flex flex-col p-1.5 gap-1 select-none pointer-events-none">
      {/* Header Area */}
      {!isSidebarLeft && !isSidebarRight && (
        <div className="w-full h-4 bg-gray-50 rounded-sm mb-0.5 flex flex-col gap-0.5 justify-center px-1">
          <div className="w-1/3 h-1 rounded-full" style={textAccentStyle}></div>
          <div className="w-1/4 h-0.5 bg-gray-200 rounded-full"></div>
        </div>
      )}

      <div className="flex-1 flex gap-1 h-full overflow-hidden">
        {/* Left Sidebar */}
        {isSidebarLeft && (
          <div className="w-[28%] h-full bg-slate-50 rounded-sm p-1 flex flex-col gap-1">
            <div
              className="w-4 h-4 rounded-full mb-1 mx-auto"
              style={accentStyle}
            ></div>
            <div className="w-full h-0.5 bg-gray-200 rounded"></div>
            <div className="w-full h-0.5 bg-gray-200 rounded"></div>
            <div className="w-2/3 h-0.5 bg-gray-200 rounded"></div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col gap-1 ${
            isGrid ? "grid grid-cols-2 gap-1" : ""
          }`}
        >
          {/* If Sidebar Layout, add a small header in main area */}
          {(isSidebarLeft || isSidebarRight) && (
            <div className="w-full h-2.5 bg-gray-50 rounded-sm"></div>
          )}

          {isGrid ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-sm p-0.5 flex flex-col gap-0.5"
                  style={lightAccentStyle}
                >
                  <div className="w-full h-0.5 bg-gray-200"></div>
                  <div className="w-2/3 h-0.5 bg-gray-200"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div
                className="w-full h-1 rounded-sm"
                style={textAccentStyle}
              ></div>
              <div className="w-full h-10 bg-gray-50/50 rounded-sm border border-dashed border-gray-200"></div>
              <div className="w-3/4 h-1 bg-gray-100 rounded-sm"></div>
              <div className="w-full h-4 bg-gray-50/50 rounded-sm border border-dashed border-gray-200"></div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        {isSidebarRight && (
          <div
            className="w-[28%] h-full rounded-sm p-1 flex flex-col gap-1"
            style={accentStyle}
          >
            <div className="w-full h-0.5 bg-white/40 rounded"></div>
            <div className="w-full h-0.5 bg-white/40 rounded"></div>
            <div className="w-2/3 h-0.5 bg-white/40 rounded"></div>
          </div>
        )}
      </div>
    </div>
  );
};
