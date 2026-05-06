// ═══════════════════════════════════════════════════════════
// React Query hooks — Lab (tests, samples, results)
// ═══════════════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLabTests,
  submitLabTestResult,
  fetchSamples,
  fetchTestResults,
} from "../api/lab";
import type { LabResultData } from "../types/lab";

/** Fetch all lab tests (pending + completed) */
export function useLabTests() {
  return useQuery({
    queryKey: ["lab-tests"],
    queryFn: fetchLabTests,
  });
}

/** Submit screening result for a lab test */
export function useSubmitLabResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      result,
    }: {
      testId: string;
      result: LabResultData & {
        notes: string;
        suitable: boolean;
      };
    }) => submitLabTestResult(testId, result),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lab-tests"] });
      qc.invalidateQueries({ queryKey: ["samples"] });
      qc.invalidateQueries({ queryKey: ["test-results"] });
      qc.invalidateQueries({ queryKey: ["bags"] });
    },
  });
}

/** Fetch all samples */
export function useSamples() {
  return useQuery({
    queryKey: ["samples"],
    queryFn: fetchSamples,
  });
}

/** Fetch all test results */
export function useTestResults() {
  return useQuery({
    queryKey: ["test-results"],
    queryFn: fetchTestResults,
  });
}
