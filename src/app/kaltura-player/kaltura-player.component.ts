/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { config } from '../config';
import { KalturaService } from '../kaltura.service';

declare global {
  interface Window { kWidget: any; }
}
export class KalturaConfig {
  constructor(
    public partnerId: string,
    public uiconfid: string,
    public flashvars: {
      hotspots?: {
        plugin: boolean,
      },
      statistics?: {
        plugin: boolean,
        position?: string,
        trackEventMonitor?: string,
        relativeTo?: string,
        playbackContext?: string,
        originFeature?: string,
        applicationName?: string,
        userId?: string,
        hideUserId?: boolean,
        delay?: string,
        hideKs?: boolean
      },
      transcript?: {
        collapsed: boolean;
      },
      accessibilityButtons: {
        plugin: boolean;
        positionBtn: boolean;
        forwardBtn: boolean;
        backwardBtn: boolean;
        seekTime?: number,
      },
      onPageCss1?: string;
      IframeCustomPluginCss1?: string;
      IframeCustomPluginJs1?: string;
      myComponent?: {
        plugin: boolean,
        img: string,
        iframeHTML5Js: string,
        iframeHTML5Css: string;
      },
    }
  ) { }
}
@Component({
  selector: 'kaltura-player',
  templateUrl: "./kaltura-player.component.html",
})
export class KalturaPlayerComponent {
  @Input() set entryId(entryId: string) {
    this.videoId = entryId;
    this.loadDependencies();
  }
  @Input() config!: KalturaConfig;
  @Input() width = "100%";
  @Input() height = "100%";

  @Input() enableAnalytics = false

  @Output() ready: EventEmitter<boolean> = new EventEmitter<boolean>();

  kdp: any;
  kWidget: any;

  videoId!: string;

  playerReady = false;

  videoTargetId = 'kaltura_player';

  playerInitializationInterval = 0;

  constructor(
    private readonly kalturaService: KalturaService,
  ) {
    this.kWidget = window.kWidget;
  }

  ngAfterViewInit(): void {
    this.appendScript();
  }

  appendScript() {
    if (!document.getElementById("kalturaPlayerLib")) {
      const {
        partnerId
      } = this.kalturaService.getKalturaParameters();
      const uiConfigId = this.getUiConfigId();
      const script = document.createElement('script');
      script.src = `https://cdnapisec.kaltura.com/p/${partnerId}/sp/${partnerId}00/embedIframeJs/uiconf_id/${uiConfigId}/partner_id/${partnerId}`;
      script.id = "kalturaPlayerLib";
      script.async = false;
      document.head.appendChild(script);
    }
    // wait for lib to load if not loaded and then embed player
    if (typeof window.kWidget === "undefined") {
      const intervalID = setInterval(() => {
        if (typeof window.kWidget !== "undefined") {
          clearInterval(intervalID);
          this.kWidget = window.kWidget;
          this.loadDependencies();
        }
      }, 50);
    } else {
      this.loadDependencies();
    }
  }

  private getConfig() {
    let config = this.config;
    if (!config) {
      const {
        userId,
        partnerId,
      } = this.kalturaService.getKalturaParameters();
      config = {
        partnerId,
        uiconfid: String(this.getUiConfigId()),
        flashvars: {
          hotspots: {
            plugin: true,
          },
          transcript: {
            collapsed: false
          },
          accessibilityButtons: {
            plugin: true,
            positionBtn: false,
            forwardBtn: true,
            backwardBtn: true,
            seekTime: 10,
          },
          // onPageCss1: "/assets/css/onpage.css",
          IframeCustomPluginCss1: "/assets/css/player_custom.css",
        }
      };
      // mw.setConfig("EmbedPlayer.DisableContextMenu",true);
      if (this.enableAnalytics) {
        config.flashvars.statistics = {
          plugin: true,
          "position": "after",
          "trackEventMonitor": "kalturaSendAnalyticEvent",
          "relativeTo": "video",
          "playbackContext": "123",
          "originFeature": "0",
          "applicationName": "abc",
          "userId": userId,
          "hideUserId": false,
          "delay": "1",
          "hideKs": false,
        };
      }
    }
    return config;
  }

  public getUiConfigId() {
    return this.enableAnalytics ? config.kalturaUiConfIdWithAnalytics : config.kalturaUiConfIdWithoutAnalytics;
  }

  public loadDependencies() {
    this.embedPlayer();
  }

  private async embedPlayer() {
    if (this.videoId) {
      const config = this.getConfig();
      if (typeof this.kWidget === "undefined") {
        return;
      }
      await this.kalturaService.init('*');

      const targetId = this.videoTargetId;

      const playerElement = document.getElementById(targetId);
      if (!playerElement) {
        setTimeout(() => { // some issue with kWidget
          this.embedPlayer();
        }, 0);
      }

      this.kWidget.thumbEmbed({
        'targetId': this.videoTargetId,
        'wid': `_${config.partnerId}`,
        'uiconf_id': this.getUiConfigId(),
        'entry_id': this.videoId,
      });

      this.kWidget.embed({
        targetId,
        wid: `_${config.partnerId}`,
        uiconf_id: config.uiconfid,
        flashvars: config.flashvars,
        cache_st: 1645705220,
        entry_id: this.videoId,
      });
      this.kWidget.addReadyCallback((tID: string) => {
        this.kdp = document.getElementById(tID);
        if (this.kdp?.kBind && !this.playerReady) {
          this.playerReady = true;
          this.ready.emit(true);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.kdp) {
      this.kdp.kUnbind("playerPlayEnd");
      this.kdp.kUnbind('playerUpdatePlayhead');
    }
    this.playerReady = false;
  }

}