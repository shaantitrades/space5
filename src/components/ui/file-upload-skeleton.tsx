'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function FileUploadSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area Skeleton */}
      <div className="border-2 border-dashed rounded-lg p-12 text-center mb-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto mb-4" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>

      {/* File List Skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}
