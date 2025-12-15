
> cloud9resume@1.0.0 type-check
> tsc --noEmit

components/PortfolioPreviewModal.tsx(9,3): error TS2305: Module '"./Icons"' has no exported member 'TrashIcon'.
pages/dashboard/portfolio.tsx(13,16): error TS2339: Property 'del' does not exist on type '{ loading: boolean; error: string | null; request: <T = any>(endpoint: string, method?: HttpMethod, body?: any, customHeaders?: Record<string, string> | undefined) => Promise<...>; ... 6 more ...; handle401Logout: (currentPath?: string | undefined) => Promise<...>; }'.
