import { IPerson } from 'lib/model/Person';
import generateId from "lib/model/UUIDProvider";

export function createEmptyState(): IPerson {
  return {
    personId: generateId(),
    accounts: [],
    introSteps: []
  };
}
