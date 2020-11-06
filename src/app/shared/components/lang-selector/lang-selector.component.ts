import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface LanguageItem {
  id: string;
  flagId?: string;
  name: string;
}
// register any new language here with its flag code
const languagesDb: LanguageItem[] = [
  { id: 'de', name: 'Deutsch', flagId: 'de' },
  { id: 'en', name: 'English', flagId: 'gb' },
];

@Component({
  selector: 'viega-lang-selector',
  templateUrl: './lang-selector.component.html',
  styleUrls: ['./lang-selector.component.scss'],
})

export class LangSelectorComponent implements OnInit {
  @Input() isMobile = false;

  selectedLang?: LanguageItem;

  public appLanguages: LanguageItem[] = [];

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.appLanguages = languagesDb.filter((lang) => this.translate.langs.includes(lang.id));
    this.translate.onLangChange.subscribe(() => {
      this.selectedLang = this.appLanguages.find((language) => language.id === this.translate.currentLang);
    });
  }

  onLangChange(langId: string): void {
    this.translate.use(langId).subscribe(
      () => {
        this.selectedLang = this.appLanguages.find((language) => language.id === this.translate.currentLang);
        window.location.reload(); // TODO: Workaround for TWMS2020-1525 after TWMS2020-3580
      },
    );
  }
}
