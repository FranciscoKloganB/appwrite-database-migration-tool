import { createId } from './createId';

describe('createId', () => {
  it('should return a unique nanoid ID with 20 characters', () => {
    const result = createId();

    expect(result.length).toBe(20);
  });

  it('should only contain lower case letters or numbers', () => {
    const ids: string[] = Array.from({ length: 100 }, () => createId());

    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+$/));
  });
});
