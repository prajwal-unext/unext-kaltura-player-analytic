import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KalturaPlayerComponent } from './kaltura-player/kaltura-player.component';
import { KalturaService } from './kaltura.service';
import { SafePipeModule } from './pipes/safe.pipe';
import { PlayerComponent } from './player/player.component';
import { VideoAnalyticsComponent } from './video-analytics/video-analytics.component';
import { MainPageComponent } from './main-page/main-page.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    VideoAnalyticsComponent,
    KalturaPlayerComponent,
    MainPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SafePipeModule,
  ],
  providers: [KalturaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
