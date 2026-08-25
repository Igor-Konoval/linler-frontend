export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  WORKSPACE: '/workspace',

  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const PATHNAME_HEADER = 'x-current-pathname';

export const PaginationQueryParams = {
  LIMIT: 'limit',
  PAGE: 'page',
};

export const PaginationQueryParamsValues = {
  LIMIT: 10,
  PAGE: 1,
};

export const AUTH_PAGES_URLS_ARRAY = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const PROTECTED_PAGES_URLS_ARRAY = [
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.HOME,
  ROUTES.WORKSPACE,
];
