/**
 * Creates a promise that can be rejected or resolved on demand
 *
 * Quick example:
 * ```javascript
 *   test('No state updates happen if the component is unmounted while pending', async () => {
 *     const {promise, resolve} = deferred()
 *     const {result, unmount} = renderHook(() => useAsync())
 *     let p
 *     act(() => { p = result.current.run(promise) })
 *     unmount()
 *     await act(async () => {
 *         resolve()
 *         await p
 *     })
 *     expect(console.error).not.toHaveBeenCalled()
 *   })
 * ```
 */
export function deferred<TResolve = unknown, TReject = unknown>() {
  let resolve: (value?: TResolve) => void = () => undefined;
  let reject: (reason?: TReject) => void = () => undefined;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, reject, resolve };
}
