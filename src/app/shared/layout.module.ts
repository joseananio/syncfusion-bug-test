import { NgModule } from '@angular/core';

export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@NgModule()
export class LayoutModule {
  /**
   * These are the breakpoints defined by Bootstrap.
   * In case these values are changed in css, they also have to be updated here.
   *
   * @see https://github.com/twbs/bootstrap/blob/master/scss/_variables.scss
   */
  private static breakpoints = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  };

  /**
   * Checks if the page should be rendered in mobile mode.
   *
   * @returns If the page should be rendered in mobile mode.
   */
  public static isMobile(): boolean {
    // When >= md, we consider this a desktop screen.
    return window.innerWidth < LayoutModule.breakpoints.md;
  }

  public static getHideAtMedia(name: LayoutBreakpoint): string {
    return `(min-width: ${this.breakpoints[name]}px)`;
  }

  public static getBreakpoint(name: LayoutBreakpoint): string {
    return `${this.breakpoints[name]}px`;
  }

  public static isCurrentBreakpoint(inputBreakpoints: LayoutBreakpoint[] | LayoutBreakpoint): boolean {
    const breakpoints = Array.isArray(inputBreakpoints) ? inputBreakpoints : [inputBreakpoints];

    return (breakpoints).some((breakPoint) => {
      if (breakPoint === 'xs') {
        return window.innerWidth < this.breakpoints.sm;
      }

      if (breakPoint === 'sm') {
        return window.innerWidth >= this.breakpoints.sm && window.innerWidth < this.breakpoints.md;
      }

      if (breakPoint === 'md') {
        return window.innerWidth >= this.breakpoints.md && window.innerWidth < this.breakpoints.lg;
      }

      if (breakPoint === 'lg') {
        return window.innerWidth >= this.breakpoints.lg && window.innerWidth < this.breakpoints.xl;
      }

      if (breakPoint === 'xl') {
        return window.innerWidth >= this.breakpoints.xl;
      }

      return false;
    });
  }
}
