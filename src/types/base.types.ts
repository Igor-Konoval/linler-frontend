export interface PaginationMeta {
  totalItems: number;
  limit: number;
  page: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  limit: number;
  page?: number;
}
