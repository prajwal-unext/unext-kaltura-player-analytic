/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { KalturaClient, KalturaRequest } from 'kaltura-typescript-client';
import {
  KalturaSessionType, SessionStartActionArgs, SessionStartAction,
} from 'kaltura-typescript-client/api/types';
import { config } from './config';


const KS_TOKEN_STORAGE_KEY = 'ksToken';
const KS_TOKEN_EXPIRY_KEY = 'expiry';

@Injectable({
  providedIn: 'root'
})
export class KalturaService {

  private client!: KalturaClient;

  constructor() { }

  public getKalturaParameters() {
    const adminSecret = config.kalturaAdminSecret as any;
    const partnerId = config.kalturaPartnerId as any;
    const uiConfIdForAnalytics = config.kalturaPreviewUIConfId as any;;
    const uiConfIdWithAnalytics = config.kalturaUiConfIdWithAnalytics as any;;
    const uiConfIdWithoutAnalytics = config.kalturaUiConfIdWithoutAnalytics as any;;
    const serviceUrl = config.kalturaServiceUrl as any;
    const userId = config.kalturaServiceUrl as any;
    return {
      userId,
      uiConfIdWithAnalytics,
      uiConfIdWithoutAnalytics,
      uiConfIdForAnalytics,
      serviceUrl,
      adminSecret,
      partnerId
    };
  }

  private async getConfig() {
    const endpointUrl = config.kalturaEndPointUrl;
    const configuration = {
      clientTag: "sample-code", // need to check
      endpointUrl,
    };
    return configuration;
  }

  private async getClientInstance(): Promise<KalturaClient> {
    if (!this.client) {
      const config = await this.getConfig();
      this.client = new KalturaClient(config);
    }
    return this.client;
  }

  public getKSToken(): string | null {
    const token = localStorage.getItem(KS_TOKEN_STORAGE_KEY);
    return token;
  }

  private setKSToken(response: any) {
    const existingKSToken = this.getKSToken();
    if (!existingKSToken || existingKSToken !== response.ksToken) {
      localStorage.setItem(KS_TOKEN_STORAGE_KEY, response.ksToken);
      const currentTime: any = Math.floor(Date.now() / 1000);
      const expiry: any = parseInt(currentTime) + parseInt(response.expiry);
      localStorage.setItem(KS_TOKEN_EXPIRY_KEY, expiry);
    }
  }
  private getKSTokenExpiry() {
    const expiry = localStorage.getItem(KS_TOKEN_EXPIRY_KEY);
    return expiry;
  }

  private async request<T>(request: KalturaRequest<T>) {
    await this.refreshSession();
    const client = await this.getClientInstance();
    const ks = this.getKSToken();
    if (ks) {
      client.setDefaultRequestOptions({ ks });
    }
    return client.request<T>(request);
  }

  async refreshSession() {
    const ksToken = this.getKSToken();
    if (ksToken) {
      const ksTokenExpiry: any = this.getKSTokenExpiry();
      const currentTime = Math.floor(Date.now() / 1000);
      if (ksTokenExpiry) {
        const timeleft = ksTokenExpiry - currentTime;
        if (timeleft < 3600) {
          await this.init();
        }
        return;
      }
    }
    await this.init();
  }

  async init(inputPrivileges?: string, startSessionParams?: Partial<SessionStartActionArgs>) {
    const ksToken = await this.createSession(inputPrivileges, startSessionParams);

    if (ksToken) {
      this.setKSToken(ksToken);
    }
  }

  async createSession(inputPrivileges?: string, startSessionParams?: Partial<SessionStartActionArgs>) {
    const {
      adminSecret,
      partnerId
    } = this.getKalturaParameters();
    const client = await this.getClientInstance();
    const secret = adminSecret;
    const userId = config.userId;
    const expiry = 86400;
    const type = KalturaSessionType.admin;
    const startSessionArgs: SessionStartActionArgs = {
      userId,
      secret,
      type,
      partnerId,
      privileges: inputPrivileges ? inputPrivileges : '*', // might need to check this
      expiry,
    };
    if (startSessionParams?.userId) {
      startSessionArgs.userId = startSessionParams.userId;
    }
    if (startSessionParams?.secret) {
      startSessionArgs.secret = startSessionParams.secret;
    }
    if (startSessionParams?.type) {
      startSessionArgs.type = startSessionParams.type;
    }
    const startSessionRequest = new SessionStartAction(startSessionArgs);
    const ksToken = await client.request(startSessionRequest);
    return ksToken;
  }
}
