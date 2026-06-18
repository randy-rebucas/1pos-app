/** Catches JS errors and promise rejections that occur outside React's render
 * tree (e.g. in event handlers or async callbacks), which AppErrorBoundary
 * cannot see. Logs them instead of letting them surface as a silent crash.
 */
export function installGlobalErrorHandlers() {
  const errorUtils = (global as { ErrorUtils?: ErrorUtils }).ErrorUtils;
  if (errorUtils) {
    const previousHandler = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((error, isFatal) => {
      console.error(`Global error (fatal=${isFatal}):`, error);
      previousHandler?.(error, isFatal);
    });
  }

  const rejectionTarget = global as unknown as {
    addEventListener?: (
      type: string,
      listener: (event: { reason?: unknown }) => void,
    ) => void;
  };
  rejectionTarget.addEventListener?.("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event?.reason);
  });
}

interface ErrorUtils {
  getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
}
