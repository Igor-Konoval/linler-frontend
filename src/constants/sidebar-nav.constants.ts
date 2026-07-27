export const SIDEBAR_NAV_SECTIONS = {
  PROJECTS: 'Projects',
  PRIVATE: 'Private',
  MEMBERS: 'Members',
} as const;

export const SIDEBAR_NAV_DEFAULT_OPEN: string[] =
  Object.values(SIDEBAR_NAV_SECTIONS);
