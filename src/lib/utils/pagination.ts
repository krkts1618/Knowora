export interface PaginationParams {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultPage = 1,
  defaultPageSize = 20,
  maxPageSize = 100
): PaginationParams {
  const rawPage = parseInt(searchParams.get("page") || "", 10);
  const rawPageSize = parseInt(searchParams.get("pageSize") || "", 10);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : defaultPage;
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, maxPageSize)
      : defaultPageSize;

  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    limit: pageSize,
    offset,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
