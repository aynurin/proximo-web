import { v4 as uuidv4 } from 'uuid';

export default function generateId(): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const id: string = uuidv4();
  return id;
}
