import { IPerson } from 'lib/model/Person';
import generateId from "lib/UUIDProvider";

export function createEmptyState(): IPerson {
  return {
    personId: generateId(),
    accounts: [],
    introSteps: []
  };
}
