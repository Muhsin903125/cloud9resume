export { default as ModernTemplate } from "./ModernTemplate";
export { default as MinimalTemplate } from "./MinimalTemplate";
export { default as DarkTemplate } from "./DarkTemplate";
export { default as CreativeTemplate } from "./CreativeTemplate";
export { default as CardTemplate } from "./CardTemplate";
export { default as TimelineTemplate } from "./TimelineTemplate";

import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import DarkTemplate from "./DarkTemplate";
import CreativeTemplate from "./CreativeTemplate";
import CardTemplate from "./CardTemplate";
import TimelineTemplate from "./TimelineTemplate";

export const TEMPLATE_COMPONENTS: Record<string, React.FC<any>> = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  dark: DarkTemplate,
  creative: CreativeTemplate,
  card: CardTemplate,
  timeline: TimelineTemplate,
};

export function getTemplateComponent(templateId: string): React.FC<any> {
  return TEMPLATE_COMPONENTS[templateId] || ModernTemplate;
}
