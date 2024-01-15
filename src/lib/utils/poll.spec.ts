import { poll } from './poll';
import { sleep } from './sleep';

jest.mock('./sleep.ts', () => ({
  sleep: jest.fn(),
}));

describe('poll', () => {
  const fetcher = jest.fn();
  const isReady = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('poll', () => {
    it('should return the data when isReady condition is met on the first attempt', async () => {
      const collectionData = { attributes: ['friendly', 'designation'] };

      fetcher.mockResolvedValue(collectionData);
      isReady.mockImplementation((data) => data.attributes.includes('friendly'));

      const result = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(isReady).toHaveBeenCalledTimes(1);
      expect(isReady).toHaveBeenCalledWith(collectionData);

      expect(result).toEqual([collectionData, null]);

      expect(sleep).not.toHaveBeenCalled();
    });

    it('should return the data when isReady condition is met on the second attempt', async () => {
      const firstCollectionData = { attributes: ['designation'] };
      const secondCollectionData = { attributes: ['friendly', 'designation'] };

      fetcher
        .mockResolvedValueOnce(firstCollectionData)
        .mockResolvedValueOnce(secondCollectionData);

      isReady.mockImplementation((data) => data.attributes.includes('friendly'));

      const result = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(isReady).toHaveBeenCalledTimes(2);
      expect(isReady).toHaveBeenNthCalledWith(1, firstCollectionData);
      expect(isReady).toHaveBeenNthCalledWith(2, secondCollectionData);

      expect(result).toEqual([secondCollectionData, null]);

      expect(sleep).toHaveBeenCalledTimes(1);
    });

    it('should return a single error array when all attempts resolve but fail to meet the `isReady` condition', async () => {
      const collectionData = { attributes: [] };

      fetcher.mockResolvedValue(collectionData);
      isReady.mockReturnValue(false);

      const [data, errors] = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(6);
      expect(isReady).toHaveBeenCalledTimes(6);
      expect(isReady).toHaveBeenNthCalledWith(1, collectionData);
      expect(isReady).toHaveBeenNthCalledWith(2, collectionData);
      expect(isReady).toHaveBeenNthCalledWith(3, collectionData);
      expect(isReady).toHaveBeenNthCalledWith(4, collectionData);
      expect(isReady).toHaveBeenNthCalledWith(5, collectionData);
      expect(isReady).toHaveBeenNthCalledWith(6, collectionData);

      expect(data).toBeNull();
      expect(errors).toBeInstanceOf(Array);
      expect(errors).toHaveLength(1);
      expect(errors![0]).toBeInstanceOf(Error);

      expect(sleep).toHaveBeenCalledTimes(5);
    });

    it('should return a two error array when the fetcher rejects once and subsequent attempts resolve without meeting the `isReady` condition', async () => {
      const fetchError = new Error('First fetch exception');

      fetcher.mockRejectedValueOnce(fetchError);
      isReady.mockReturnValue(false);

      const [data, errors] = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(6);
      expect(isReady).toHaveBeenCalledTimes(5);

      expect(data).toBeNull();
      expect(errors).toBeInstanceOf(Array);
      expect(errors).toHaveLength(2);
      expect(errors![0]).toEqual(fetchError);
      expect(errors![1]).toBeInstanceOf(Error);

      expect(sleep).toHaveBeenCalledTimes(5);
    });

    it('should return a three error array when the fetcher rejects twice and subsequent attempts resolve without meeting the `isReady` condition', async () => {
      const firstFetchError = new Error('First fetch exception');
      const secondFetchError = new Error('Second fetch exception');

      fetcher
        .mockRejectedValueOnce(firstFetchError)
        .mockRejectedValueOnce(secondFetchError)
        .mockResolvedValue({ attributes: [] });

      isReady.mockReturnValue(false);

      const [data, errors] = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(6);
      expect(isReady).toHaveBeenCalledTimes(4);

      expect(data).toBeNull();
      expect(errors).toBeInstanceOf(Array);
      expect(errors).toHaveLength(3);
      expect(errors![0]).toEqual(firstFetchError);
      expect(errors![1]).toEqual(secondFetchError);

      expect(sleep).toHaveBeenCalledTimes(5);
    });

    it('should return a three error array when the fetcher rejects twice and other intertwined attempts resolve without meeting the `isReady` condition', async () => {
      const firstFetchError = new Error('First fetch exception');
      const secondFetchError = new Error('Second fetch exception');

      fetcher
        .mockRejectedValueOnce(firstFetchError)
        .mockResolvedValueOnce({ attributes: [] })
        .mockRejectedValueOnce(secondFetchError)
        .mockResolvedValue({ attributes: [] });

      isReady.mockReturnValue(false);

      const [data, errors] = await poll({
        fetcher,
        isReady,
      });

      expect(fetcher).toHaveBeenCalledTimes(6);
      expect(isReady).toHaveBeenCalledTimes(4);

      expect(data).toBeNull();
      expect(errors).toBeInstanceOf(Array);
      expect(errors).toHaveLength(3);
      expect(errors![0]).toEqual(firstFetchError);
      expect(errors![1]).toEqual(secondFetchError);

      expect(sleep).toHaveBeenCalledTimes(5);
    });
  });
});
