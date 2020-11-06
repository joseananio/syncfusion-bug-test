import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'stringReplace'})
export class StringReplacePipe implements PipeTransform {
    public transform(value: string, replaceRegex: string, withString: string): string {
        const regex = new RegExp(replaceRegex, 'g');
        return value.replace(regex, withString);
    }
}
