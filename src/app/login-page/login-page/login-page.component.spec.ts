import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { LoginPageComponent } from './login-page.component';
import { LoginFormComponent } from '../login-form/login-form.component';

xdescribe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ViegaCommonModule],
      declarations: [LoginPageComponent, LoginFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
