/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { serviceConfig } from 'src/config/gateway.config';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly httpService: HttpService) {}

  async proxyRequest(
    serviceName: keyof typeof serviceConfig,
    method: string,
    path: string,
    data?: any,
    headers?: any,
    userInfo?: any,
  ) {
    const service = serviceConfig[serviceName];
    const url = `${service.url}${path}`;

    this.logger.log(`Proxying ${method} request to ${serviceName}: ${url}`);

    try {
      const enchancedHeaders = {
        ...headers,
        'x-user-id': userInfo?.id,
        'x-user-email': userInfo?.email,
        'x-user-role': userInfo?.role,
      };
      const response = await firstValueFrom(
        this.httpService.request<any>({
          method: method.toLowerCase() as any,
          url,
          data,
          headers: enchancedHeaders,
          timeout: service.timeout,
        }),
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error proxying ${method} request to ${serviceName}: ${url}`,
        error,
      );
      throw error;
    }
  }

  async getServiceHealth(serviceName: keyof typeof serviceConfig) {
    try {
      const service = serviceConfig[serviceName];
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}/health`, {
          timeout: service.timeout,
        }),
      );
      return { status: 'healthy', data: response.data };
    } catch (error: any) {
      return { status: 'unhealthy', data: error.message };
    }
  }
}
