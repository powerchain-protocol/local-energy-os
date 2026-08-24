export const dashboardThemes = ["dark-green","onyx","black","white","red","framed"] as const;
export type DashboardTheme = typeof dashboardThemes[number];
export const themeLabels: Record<DashboardTheme,string> = {
 "dark-green":"Dark Green", onyx:"Onyx", black:"Black", white:"White", red:"Signal Red", framed:"Framed"
};
