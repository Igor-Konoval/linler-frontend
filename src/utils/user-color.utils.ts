const USER_COLORS = [
  '#E16259',
  '#F2A65A',
  '#E8C547',
  '#4DAB9A',
  '#529CCA',
  '#9A6DD7',
  '#E255A1',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
] as const;

export function getUserColor(userId: string): string {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = userId.charCodeAt(index) + ((hash << 5) - hash);
  }

  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}
