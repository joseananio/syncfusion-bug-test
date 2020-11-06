import {
  Directive, ElementRef, Input, Renderer2, SimpleChanges, AfterViewInit, OnChanges,
} from '@angular/core';

@Directive({
  selector: '[appBackgroundImage]',
})
export class BackgroundImageDirective implements AfterViewInit, OnChanges {
  private el: HTMLElement;

  @Input('appBackgroundImage') appBackgroundImage: string;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
    this.el = this.elRef.nativeElement;
  }

  ngAfterViewInit() {
    this.setBackgroundImage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appBackgroundImage']) {
      this.setBackgroundImage();
    }
  }

  setBackgroundImage() {
    this.renderer.setStyle(this.el, 'backgroundImage', `url(${this.appBackgroundImage})`);
  }
}
