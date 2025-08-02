import { customAlphabet } from 'nanoid';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const DEFAULT_LENGTH = 6;

const generators: Record<number, () => string> = {
  [DEFAULT_LENGTH]: customAlphabet(BASE58_ALPHABET, DEFAULT_LENGTH),
};

export class ShortId extends String {
  private __nominal: void;

  protected constructor(val: string) {
    super(val);
  }

  public static create(length = DEFAULT_LENGTH): ShortId {
    generators[length] =
      generators[length] ?? customAlphabet(BASE58_ALPHABET, length);
    const id = generators[length]();
    return new ShortId(id);
  }

  public static from(val: string): ShortId {
    return new ShortId(val);
  }
}
