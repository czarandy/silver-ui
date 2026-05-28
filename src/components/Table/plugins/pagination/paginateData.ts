export interface PaginateDataOptions {
  page: number;
  pageSize: number;
}

export function paginateData<T>(
  data: ReadonlyArray<T>,
  {page, pageSize}: PaginateDataOptions,
): T[] {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;
  return data.slice(start, start + safePageSize);
}
