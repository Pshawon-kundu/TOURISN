export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const calculatePagination = (
  total: number,
  page: number,
  limit: number
): PaginationResult => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};

export const getPaginationParams = (
  page: any = 1,
  limit: any = 10
): { page: number; limit: number; skip: number } => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
};
