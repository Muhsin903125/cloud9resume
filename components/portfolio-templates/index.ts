export { default as ModernTemplate } from "./ModernTemplate";
export { default as MinimalTemplate } from "./MinimalTemplate";
export { default as DarkTemplate } from "./DarkTemplate";
export { default as CreativeTemplate } from "./CreativeTemplate";
export { default as CardTemplate } from "./CardTemplate";
export { default as TimelineTemplate } from "./TimelineTemplate";
export { default as GlassmorphismTemplate } from "./GlassmorphismTemplate";
export { default as GradientTemplate } from "./GradientTemplate";
export { default as DeveloperTemplate } from "./DeveloperTemplate";
export { default as ExecutiveTemplate } from "./ExecutiveTemplate";

import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import DarkTemplate from "./DarkTemplate";
import CreativeTemplate from "./CreativeTemplate";
import CardTemplate from "./CardTemplate";
import TimelineTemplate from "./TimelineTemplate";
import GlassmorphismTemplate from "./GlassmorphismTemplate";
import GradientTemplate from "./GradientTemplate";
import DeveloperTemplate from "./DeveloperTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

export const TEMPLATE_COMPONENTS: Record<string, React.FC<any>> = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  dark: DarkTemplate,
  creative: CreativeTemplate,
  card: CardTemplate,
  timeline: TimelineTemplate,
  glassmorphism: GlassmorphismTemplate,
  gradient: GradientTemplate,
  developer: DeveloperTemplate,
  executive: ExecutiveTemplate,
};

export function getTemplateComponent(templateId: string): React.FC<any> {
  return TEMPLATE_COMPONENTS[templateId] || ModernTemplate;
}
