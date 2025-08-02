import { Injectable, Inject } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import qs = require('qs');
import { Account } from '@modules/v1/accounts/account.entity';
import { EventType } from '@modules/v1/events/event.entity';
import { TransactionManagerService } from '@modules/v1/transaction-manager/transaction-manager.service';
import { EntityManager } from 'typeorm';
import { SquarePosItemLink } from './square-item-link.entity';
import { SquarePos } from './square-pos.entity';
import { SquareToken } from './square-token.entity';

interface Code {
  code: string;
}

interface RefreshToken {
  refreshToken: string;
}

export type accessTokenRequest = Code | RefreshToken;

@Injectable()
export class SquareService {
  private axios: AxiosInstance;

  constructor(
    @Inject('SQUARE_APP_ID') private readonly appId,
    @Inject('SQUARE_SECRET') private readonly secret,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionMnaager: TransactionManagerService,
  ) {
    this.axios = axios.create({
      baseURL: 'https://connect.squareup.com',
      timeout: 30 * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'comma' }),
    });
  }

  async disconnect(
    accountId: Account['id'],
    manager: EntityManager = this.entityManager,
  ) {
    return await this.transactionMnaager.ensureTransactional(
      manager,
      async (manager) => {
        const token = await manager.findOneOrFail(SquareToken, { accountId });
        await this.revokeAccess(token.accessToken);
        await manager.softDelete(SquareToken, token.id);
        await manager
          .createQueryBuilder()
          .delete()
          .from(Event)
          .where('"type" = :type', {
            type: EventType.SQUARE_REFRESH_TOKEN_REQUEST,
          })
          .andWhere(`"data"->>'accountId'::text = :accountId`, { accountId })
          .andWhere(`"data"->>'tokenId'::text = :tokenId`, {
            tokenId: token.id,
          })
          .execute();
      },
    );
  }

  async getAccessToken(grant: accessTokenRequest) {
    const data: any = {
      client_id: this.appId,
      client_secret: this.secret,
    };

    if ('code' in grant) {
      data.grant_type = 'authorization_code';
      data.code = grant.code;
    } else {
      data.grant_type = 'refresh_token';
      data.refresh_token = grant.refreshToken;
    }

    const response = await this.axios.post('/oauth2/token', data);

    const {
      access_token: accessToken,
      expires_at: expiresAt,
      refresh_token: refreshToken,
    } = response.data;

    return { accessToken, expiresAt, refreshToken };
  }

  async revokeAccess(accessToken: string) {
    const data = {
      client_id: this.appId,
      access_token: accessToken,
    };

    await this.axios.post('/oauth2/revoke', data, {
      headers: {
        Authorization: 'Client ' + this.secret,
      },
      validateStatus: (status) =>
        (200 <= status && status < 300) || status === 404,
    });
  }

  async getLocations(accessToken: string) {
    const response = await this.axios.get('/v2/locations', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data.locations;
  }

  async getOrders(accessToken: string, locationId: string) {
    const data = {
      location_ids: [locationId],
    };

    const response = await this.axios.post('/v2/orders/search', data, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data;
  }

  async getOrder(accessToken: string, locationId: string, orderId: string) {
    const data = {
      order_ids: [orderId],
      location_ids: [locationId],
    };

    const response = await this.axios.post('/v2/orders/batch-retrieve', data, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data;
  }

  // Returns catalogue items filtered by location
  async getItems(accessToken: string, locationId?: string) {
    const items = [];

    let response, cursor;
    do {
      response = await this.axios.get('/v2/catalog/list', {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
        params: {
          types: ['ITEM', 'MODIFIER'],
          cursor,
        },
      });

      items.push(
        ...(response.data.objects || []).filter(
          (object) =>
            !object.is_deleted &&
            (!locationId || this.catalogObjectIsAtLocation(object, locationId)),
        ),
      );

      ({ cursor } = response.data);
    } while (cursor);

    return items;
  }

  async getItem(accessToken: string, itemId?: string) {
    return await this.axios.get(`/v2/catalog/object/${itemId}`, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
  }

  private catalogObjectIsAtLocation(object: any, locationId: string) {
    return (
      (object.present_at_all_locations &&
        !object.absent_at_location_ids?.includes(locationId)) ||
      (!object.present_at_all_locations &&
        object.present_at_location_ids?.includes(locationId))
    );
  }

  // V1 functions, to be removed when Square provides a v2 webhook which includes ALL orders (
  //   order.created only includes orders created via API (no POS orders)

  // Subscribe to v1 webhooks
  async subscribeToPaymentUpdates(accessToken: string, locationId: string) {
    return await this.axios.put(
      `/v1/${locationId}/webhooks`,
      ['PAYMENT_UPDATED'],
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );
  }

  async getV1Payment(
    accessToken: string,
    locationId: string,
    paymentId: string,
  ) {
    const response = await this.axios.get(
      `/v1/${locationId}/payments/${paymentId}`,
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    return response.data;
  }

  async hasUnassociatedItems(
    token: SquareToken,
    pos: SquarePos,
    manager: EntityManager,
  ) {
    const items = await this.getItems(token.accessToken, pos.squareLocationId);

    const links = await manager.find(SquarePosItemLink, {
      where: {
        posId: pos.id,
      },
      relations: ['item'],
    });

    return items.length > links.length;
  }
}
