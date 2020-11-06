import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that replaces substrings.
 */
@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(input: string, regex: string, replacement: string): string {
    return input.replace(new RegExp(regex, 'g'), replacement);
  }
}
