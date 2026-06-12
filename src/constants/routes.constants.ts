export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const LOGIN_QUERY_PARAM = 'login';

export const PATHNAME_HEADER = 'x-current-pathname';

export const AUTH_PAGES_URLS_ARRAY = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const PROTECTED_PAGES_URLS_ARRAY = [ROUTES.PROFILE, ROUTES.SETTINGS];
