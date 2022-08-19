import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators'
import { config } from '../config';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  enableAnalytics = false;
  entryId = config.entryId;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.activatedRoute.params.pipe(distinctUntilChanged((x, y) => x.type !== y.type)).subscribe((params) => {
      this.enableAnalytics = params.type === 'with-analytics';
    })
  }

}
