import { exponentialBackoff } from './exponentialBackoff';
import { secondsToMilliseconds } from './secondsToMilliseconds';
import { sleep } from './sleep';

type PolledData<T> = {
  fetcher: () => Promise<T>;
  isCompleted: (data: T) => boolean;
};

type PolledResult<T> = Promise<[T, null] | [null, Error]>;

export async function poll<T>({ fetcher, isCompleted }: PolledData<T>): PolledResult<T> {
  const interval = secondsToMilliseconds(5);
  const maximumRetries = 4;
  const maximumAttempts = 1 + maximumRetries;
  const rate = 2;

  let attempt = 0;
  let forwardError = new Error(`Maximum attempts reached without meeting 'isComplete' condition.`);

  while (attempt < maximumAttempts) {
    try {
      const data = await fetcher();

      if (isCompleted(data)) {
        return [data, null];
      }
    } catch (e) {
      if (e instanceof Error) {
        forwardError = e;
      } else {
        throw e;
      }
    }

    await sleep(exponentialBackoff({ interval, rate, attempt }));

    attempt++;
  }

  return [null, forwardError];
}
