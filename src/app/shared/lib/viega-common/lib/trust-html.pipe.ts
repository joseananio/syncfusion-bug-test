import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

/** Use this pipe to keep styles and other unsafe DOM when directly appling a value to innerHTML of a tag. */
@Pipe({ name: 'trustHtml' })
export class TrustHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    public transform(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
