import { Logger } from '../../index-lib';
import { exponentialBackoff } from './exponentialBackoff';
import { secondsToMilliseconds } from './secondsToMilliseconds';
import { sleep } from './sleep';

type PolledFetcher<T> = () => Promise<T>;
type PolledAsserter<T> = (data: Awaited<ReturnType<PolledFetcher<T>>>) => boolean;

type PolledData<T> = {
  fetcher: PolledFetcher<T>;
  isReady: PolledAsserter<T>;
  log?: Logger;
  error?: Logger;
};

type PolledResult<T> = Promise<[T, null] | [null, Array<Error>]>;

export async function poll<T>({
  fetcher,
  isReady,
  log = () => undefined,
  error = () => undefined,
}: PolledData<T>): PolledResult<T> {
  const interval = secondsToMilliseconds(5);
  const maximumRetries = 5;
  const maximumAttempts = 1 + maximumRetries;
  const rate = 2;

  let attempt = 0;

  const forwardErrors = [];

  while (attempt < maximumAttempts) {
    if (attempt > 0) {
      await sleep(exponentialBackoff({ interval, rate, attempt }));
    }

    try {
      const data = await fetcher();

      log(`Poll fetcher resolved. Will evaluate received data: ${JSON.stringify(data)}`);

      if (isReady(data)) {
        log(`Poll evaluation completed and data is ready for use.`);

        return [data, null];
      } else {
        log(`Poll evaluation completed and but data is not ready for use.`);
      }
    } catch (e) {
      if (e instanceof Error) {
        error(`Poll fecher rejected: ${e.message}`);

        forwardErrors.push(e);
      } else {
        forwardErrors.push(new Error(`Unexpected exception of type ${typeof e} occured.`));
      }
    }

    attempt++;
  }

  forwardErrors.push(new Error(`Maximum attempts reached without meeting 'isReady' condition.`));

  return [null, forwardErrors];
}
