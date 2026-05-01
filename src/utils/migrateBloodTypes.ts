/**
 * Migration utility to convert old blood type format (O, A, B, AB) to new format (O+, O-, etc.)
 */

import type { Person, BloodType } from '../types';

// Map old blood types to new format (defaulting to positive)
const bloodTypeMigration: Record<string, BloodType> = {
  'O': 'O+',
  'A': 'A+',
  'B': 'B+',
  'AB': 'AB+',
};

/**
 * Migrate a single blood type from old format to new format
 */
export function migrateBloodType(oldType: string): BloodType {
  if (oldType.includes('+') || oldType.includes('-')) {
    // Already in new format
    return oldType as BloodType;
  }
  
  // Migrate from old format
  return bloodTypeMigration[oldType] || 'O+';
}

/**
 * Migrate person data with old blood types
 */
export function migratePerson(person: any): Person {
  if (person.bloodType && !person.bloodType.includes('+') && !person.bloodType.includes('-')) {
    return {
      ...person,
      bloodType: migrateBloodType(person.bloodType),
    };
  }
  return person as Person;
}

/**
 * Migrate all people in the store
 */
export function migratePeople(people: any[]): Person[] {
  return people.map(migratePerson);
}

