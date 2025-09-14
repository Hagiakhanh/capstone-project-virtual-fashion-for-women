"use client";
import { useState, useEffect, useCallback } from "react";
type ApiFunction<T> = (
  pageIndex: number,
  pageSize: number,
  ...args: any[]
) => Promise<{ data: T; totalRecords?: number }>;

export function useGetPagination<T>(
  apiFn: ApiFunction<T>,
  initialPageIndex: number = 1,
  initialPageSize: number = 10,
  extraParams: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFn(pageIndex, pageSize, ...extraParams);

      if (Array.isArray(res)) {
        setData(res as T);
        setTotalRecords((res as any).length);
      } else {
        setData((res as any).data ?? null);
        setTotalRecords((res as any).totalRecords ?? 0);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiFn, pageIndex, pageSize, extraParams]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    totalRecords,
    loading,
    error,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    refetch: fetchData,
  };
}
