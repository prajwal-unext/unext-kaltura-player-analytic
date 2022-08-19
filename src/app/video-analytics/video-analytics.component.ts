/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { KalturaService } from 'src/app/kaltura.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { KalturaPrivileges } from 'src/app/enums/kaltura-privileges';
import videoStatStyles from 'src/app/video-analytics/video-analytics.css';
import { ActivatedRoute } from '@angular/router';
import { config } from '../config';

@Component({
  selector: 'app-video-analytics',
  templateUrl: './video-analytics.component.html',
  styleUrls: ['./video-analytics.component.scss']
})
export class VideoAnalyticsComponent implements OnInit {
  componentLoaded = false;
  @ViewChild('analyticsFrame', { static: true }) analyticsFrame!: ElementRef;

  public _windowEventListener: ((this: Window, ev: MessageEvent<any>) => any) | null = null;
  $unsubscribeRouteOperationService = new Subject<void>();
  statsSource: SafeResourceUrl = "";
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly kalturaService: KalturaService,
  ) {
  }
  ngOnInit(): void {
    this.loadDependencies();
  }

  async loadDependencies() {
    await this.loadStatistics(config.entryId);
  }

  async loadStatistics(entryId: string) {
    const {
      partnerId,
      uiConfigId,
      statsSource,
    } = this.getKalturaConfig();
    const config = {
      kalturaServer: {
        uri: 'www.kaltura.com',
        previewUIConf: uiConfigId,
      },
      analyticsServer: {
        uri: statsSource,
      },
      cdnServers: {
        "serverUri": "http://cdnapi.kaltura.com",
        "securedServerUri": "https://cdnapisec.kaltura.com"
      },
      // liveAnalytics: serverConfig.externalApps.liveAnalytics,
      ks: await this.getKsTokenForAnalytics(),
      pid: partnerId,
      locale: 'en',
      liveEntryUsersReports: 'All',
      dateFormat: 'month-day-year',
      multiAccount: false,
      previewPlayer: {
        loadJquery: false
      },
      menuConfig: {
        showMenu: false,
      },
      customStyle: {
        baseClassName: "kms",
        css: videoStatStyles,
      },
    };
    this._windowEventListener = (event) => {
      let postMessageData;
      try {
        postMessageData = event.data;
      } catch (ex) {
        return;
      }
      if (postMessageData.messageType === 'analyticsInit') {
        const menusConfig = postMessageData.payload.menuConfig;
        const viewsConfig = postMessageData.payload.viewsConfig;
        this.sendMessageToAnalyticsApp({
          messageType: 'init',
          payload: {
            ...config,
            menusConfig,
            viewsConfig,
          }
        });
      }
      if (postMessageData.messageType === 'analyticsInitComplete') {
        this.sendMessageToAnalyticsApp({
          messageType: "navigate",
          payload: {
            url: `/entry/${entryId}`,
          },
        });

        this.sendMessageToAnalyticsApp({
          messageType: "updateFilters",
          payload: {
            queryParams: {
              dateBy: "sinceCreation",
            },
          },
        });
      }
      if (postMessageData.messageType === 'updateLayout') {
        this.updateLayout(postMessageData.payload.height);
        this.componentLoaded = true;
      }
      if (postMessageData.messageType === 'navigateTo') {
        const [url, params] = postMessageData.payload.split('?');
        const queryParams = params.split('&').reduce((acc: any, val: string) => {
          const [key, value] = val.split('=');
          acc[key] = value;
          return acc;
        }, {});

        this.sendMessageToAnalyticsApp({ 'messageType': 'navigate', payload: { url, queryParams } });
        this.sendMessageToAnalyticsApp({ 'messageType': 'updateFilters', payload: { queryParams } });
      }
    };
    this._addPostMessagesListener();
    this.statsSource = statsSource;
  }

  private _addPostMessagesListener() {
    this._removePostMessagesListener();
    if (this._windowEventListener) {
      window.addEventListener('message', this._windowEventListener);
    }
  }

  private _removePostMessagesListener(): void {
    if (this._windowEventListener) {
      window.removeEventListener('message', this._windowEventListener);
    }
  }

  private updateLayout(height: number) {
    this.analyticsFrame.nativeElement.style.height = `${height}px`;
  }

  async getKsTokenForAnalytics() {
    const ksToken = await this.kalturaService.createSession(KalturaPrivileges.ANALYTICS);
    const ksTokenForAnalytics = ksToken;
    return ksTokenForAnalytics;
  }

  getKalturaConfig() {
    const statsSource = "https://kmc.kaltura.com/apps/kmc-analytics/v3.0.1/index.html";
    const partnerId = config.kalturaPartnerId;
    const uiConfigId = config.kalturaPreviewUIConfId;
    const serviceUrl = config.kalturaServiceUrl;
    return {
      statsSource,
      partnerId,
      uiConfigId,
      serviceUrl
    };
  }

  private sendMessageToAnalyticsApp(message: object): void {
    if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow && this.analyticsFrame.nativeElement.contentWindow.postMessage) {
      this.analyticsFrame.nativeElement.contentWindow.postMessage(message, 'https://kmc.kaltura.com');
    }
  }

}