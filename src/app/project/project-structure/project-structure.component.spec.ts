import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStructureComponent } from './project-structure.component';

xdescribe('ProjectStructureComponent', () => {
  let component: ProjectStructureComponent;
  let fixture: ComponentFixture<ProjectStructureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectStructureComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
