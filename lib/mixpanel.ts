import mixpanel from "mixpanel-browser";

export const MIXPANEL_TOKEN = "0e4aac59dc3cc66c7cd8e070c479fd28";

export const initMixpanel = () => {
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });
};

export const trackEvent = (name: string, props: Record<string, any> = {}) => {
  mixpanel.track(name, props);
};

export const trackPageView = (url: string) => {
  mixpanel.track("Page View", {
    path: url,
  });
};
