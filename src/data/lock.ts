// Uma aba só por banco: o OPFS não aceita dois escritores. A trava dura até a aba fechar.
export function acquireLock(name: string): Promise<boolean> {
  if (!('locks' in navigator)) return Promise.resolve(true);
  return new Promise((resolve) => {
    void navigator.locks.request(name, { ifAvailable: true }, (lock) => {
      resolve(lock !== null);
      return lock ? new Promise<void>(() => undefined) : undefined;
    });
  });
}
