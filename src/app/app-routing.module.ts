import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PlayerComponent } from './player/player.component';
import { VideoAnalyticsComponent } from './video-analytics/video-analytics.component';

const routes: Routes = [{
  path: '',
  component: MainPageComponent,
  children: [{
    path: 'analytics',
    component: VideoAnalyticsComponent,
  }, {
    path: "player/:type",
    component: PlayerComponent,
  }]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
