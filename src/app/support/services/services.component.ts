import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})

export class ServicesComponent implements OnInit {
  public countries = [
    _('SUPPORT.GERMANY'),
    _('SUPPORT.AUSTRIA'),
    _('SUPPORT.SWITZERLAND'),
    _('SUPPORT.LICHTENSTEIN'),
  ];

  public contacts: Contact[] = [
    {
      country: this.countries[0],
      address: _('SUPPORT.TECHNICAL_SUPPORT'),
      mobile: '+49 (0) 2722 61-1100',
      fax: '+49 (0) 2722 61-1101',
      emails: ['service-technik@viega.de'],
    },
    {
      country: this.countries[1],
      address: _('SUPPORT.TECHNICAL_SUPPORT_SOFTWARE_SUPPORT'),
      mobile: '+43 (0) 76 62 29 880-80',
      fax: '+43 (0) 76 62 29 880-30',
      emails: ['service-technik@viega.at', 'service-software@viega.at'],
    },
  ];

  public currentContact: Contact;

  constructor() { }

  ngOnInit() {
    this.currentContact = this.contacts[0];
  }

  public onSelect(contact): void {
    this.currentContact = contact;
  }
}
interface Contact {
  country: string;
  project?: string;
  address: string;
  mobile: string;
  fax: string;
  emails: string[];
  website?: string;
}
