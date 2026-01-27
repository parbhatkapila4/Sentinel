"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseOptimisticActionOptions<T> {
  action: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticAction<T>({
  action,
  onSuccess,
  onError,
  successMessage = "Action completed",
  errorMessage = "Something went wrong",
}: UseOptimisticActionOptions<T>) {
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await action();
      toast.success(successMessage);
      onSuccess?.(result);
      return result;
    } catch (error) {
      toast.error(errorMessage);
      onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [action, onSuccess, onError, successMessage, errorMessage]);

  return { execute, isPending };
}
