import { TestBed } from '@angular/core/testing';

import { LineNumberService } from './line-number.service';

describe('LineNumberService', () => {
  let service: LineNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
