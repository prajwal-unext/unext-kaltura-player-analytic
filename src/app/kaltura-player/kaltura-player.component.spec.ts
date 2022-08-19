import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KalturaPlayerComponent } from './kaltura-player.component';

describe('KalturaPlayerComponent', () => {
  let component: KalturaPlayerComponent;
  let fixture: ComponentFixture<KalturaPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KalturaPlayerComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KalturaPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
