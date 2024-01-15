import { poll } from './poll';
import { sleep } from './sleep';

jest.mock('./sleep.ts', () => ({
  sleep: jest.fn(),
}));

describe('poll', () => {
  const fetcher = jest.fn();
  const isCompleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('poll', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return the data fetcher data when isCompleted condition is met on the first attempt', async () => {
      const collectionData = { attributes: ['friendly', 'designation'] };

      fetcher.mockResolvedValue(collectionData);
      isCompleted.mockImplementation((data) => data.attributes.includes('friendly'));

      const result = await poll({
        fetcher,
        isCompleted,
      });

      expect(fetcher).toHaveBeenCalledTimes(1);

      expect(isCompleted).toHaveBeenCalledTimes(1);
      expect(isCompleted).toHaveBeenCalledWith(collectionData);

      expect(result).toEqual([collectionData, null]);

      expect(sleep).not.toHaveBeenCalled();
    });

    it('should return the data fetcher data when isCompleted condition is met on the second attempt', async () => {
      const firstCollectionData = { attributes: ['designation'] };
      const secondCollectionData = { attributes: ['friendly', 'designation'] };

      fetcher
        .mockResolvedValueOnce(firstCollectionData)
        .mockResolvedValueOnce(secondCollectionData);

      isCompleted.mockImplementation((data) => data.attributes.includes('friendly'));

      const result = await poll({
        fetcher,
        isCompleted,
      });

      expect(fetcher).toHaveBeenCalledTimes(2);

      expect(isCompleted).toHaveBeenCalledTimes(2);
      expect(isCompleted).toHaveBeenNthCalledWith(1, firstCollectionData);
      expect(isCompleted).toHaveBeenNthCalledWith(2, secondCollectionData);

      expect(result).toEqual([secondCollectionData, null]);

      expect(sleep).toHaveBeenCalledTimes(1);
    });

    it('should return a maximum attempts error when all attempts are expended without meeting the condition', async () => {
      const collectionData = { attributes: [] };

      fetcher.mockResolvedValue(collectionData);
      isCompleted.mockReturnValue(false);

      const [data, error] = await poll({
        fetcher,
        isCompleted,
      });

      expect(fetcher).toHaveBeenCalledTimes(5);

      expect(isCompleted).toHaveBeenCalledTimes(5);
      expect(isCompleted).toHaveBeenNthCalledWith(1, collectionData);
      expect(isCompleted).toHaveBeenNthCalledWith(2, collectionData);
      expect(isCompleted).toHaveBeenNthCalledWith(3, collectionData);
      expect(isCompleted).toHaveBeenNthCalledWith(4, collectionData);
      expect(isCompleted).toHaveBeenNthCalledWith(5, collectionData);

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toEqual(
        `Maximum attempts reached without meeting 'isComplete' condition.`,
      );

      expect(sleep).toHaveBeenCalledTimes(5);
    });

    it('should return a forwarded error when the fetcher fails', async () => {
      const fetchError = new Error('First fetch exception');

      fetcher.mockRejectedValue(fetchError);
      isCompleted.mockReturnValue(false);

      const [data, error] = await poll({
        fetcher,
        isCompleted,
      });

      expect(fetcher).toHaveBeenCalledTimes(5);

      expect(isCompleted).toHaveBeenCalledTimes(0);

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(fetchError);

      expect(sleep).toHaveBeenCalledTimes(5);
    });

    it('should return a forwarded error from the last failed fetch', async () => {
      const firstFetchError = new Error('First fetch exception');
      const secondFetchError = new Error('Second fetch exception');

      fetcher
        .mockRejectedValueOnce(firstFetchError)
        .mockRejectedValueOnce(secondFetchError)
        .mockResolvedValue({ attributes: [] });

      isCompleted.mockReturnValue(false);

      const [data, error] = await poll({
        fetcher,
        isCompleted,
      });

      expect(fetcher).toHaveBeenCalledTimes(5);

      expect(isCompleted).toHaveBeenCalledTimes(3);

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error).toEqual(secondFetchError);

      expect(sleep).toHaveBeenCalledTimes(5);
    });
  });
});
