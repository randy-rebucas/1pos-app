type UnauthorizedHandler = () => void;

const handlers = new Set<UnauthorizedHandler>();

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function notifyUnauthorized() {
  for (const handler of handlers) {
    try {
      handler();
    } catch {
      // ignore handler failures during sign-out
    }
  }
}
