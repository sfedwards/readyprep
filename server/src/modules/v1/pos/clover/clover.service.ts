import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CloverPosItemLink } from './clover-item-link.entity';
import { CloverPos } from './clover-pos.entity';
import { CloverToken } from './clover-token.entity';

@Injectable()
export class CloverService {
  private axios: AxiosInstance;

  constructor(
    @Inject('CLOVER_APP_ID') private readonly clientId: string,
    @Inject('CLOVER_APP_SECRET') private readonly clientSecret: string,
  ) {
    this.axios = axios.create({
      baseURL:
        process.env.NODE_ENV === 'development'
          ? 'https://apisandbox.dev.clover.com'
          : 'https://api.clover.com',
      timeout: 30 * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccessToken(code: string): Promise<{ accessToken: string }> {
    const response = await this.axios.get('/oauth/token', {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      },
    });

    const { access_token: accessToken } = response.data;

    return { accessToken };
  }

  async getOrder({
    accessToken,
    merchantId,
    orderId,
  }: {
    accessToken: string;
    merchantId: string;
    orderId: string;
  }): Promise<{ id: string; name: string }[]> {
    const response = await this.axios.get(
      `/v3/merchants/${merchantId}}/orders/${orderId}`,
      {
        params: {
          expand: 'lineItems',
        },
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    return response.data.lineItems.elements.map((element) => {
      return {
        id: element.item.id,
        name: element.name,
      };
    });
  }

  async getItems({
    accessToken,
    merchantId,
  }: {
    accessToken: string;
    merchantId: string;
  }): Promise<{ id: string; name: string; price: number }[]> {
    const response = await this.axios.get(`/v3/merchants/${merchantId}/items`, {
      headers: {
        authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data.elements.map((element) => {
      return {
        id: element.id,
        name: element.name,
        price: element.price,
      };
    });
  }

  @Transactional()
  async hasUnassociatedItems(
    token: CloverToken,
    pos: CloverPos,
  ): Promise<boolean> {
    const manager = Transactional.getManager();
    const items = await this.getItems({
      accessToken: token.accessToken,
      merchantId: pos.cloverMerchantId,
    });

    const links = await manager.find(CloverPosItemLink, {
      where: {
        posId: pos.id,
      },
      relations: ['item'],
    });

    return items.length > links.length;
  }
}
