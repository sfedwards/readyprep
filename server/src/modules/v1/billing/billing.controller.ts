import {
  Controller,
  Post,
  Inject,
  Body,
  Session,
  BadRequestException,
  Request,
  Response,
  Get,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import Stripe from 'stripe';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { SquareService } from '../pos/square/square.service';
import Segment = require('analytics-node');

@Controller('billing')
export class BillingController {
  constructor(
    @Inject('Stripe') private readonly stripe: Stripe,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly billingService: BillingService,
    private readonly squareService: SquareService,
    private readonly transactionManager: TransactionManagerService,
    private readonly segment: Segment,
  ) {}

  // Stripe Webhook listener
  @Post('webhook')
  async webhook(@Request() req: any, @Response() res) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        this.configService.get('stripe.endpointSecret'),
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const {
        customer,
        plan: { product: productId },
        status,
        trial_end,
      } = event.data.object;

      const trialEnd = trial_end ? new Date(trial_end * 1000) : null;
      const product = await this.stripe.products.retrieve(productId);
      const plan = product.metadata.plan as Account['plan'];

      if (trialEnd && event.type === 'customer.subscription.created') {
        try {
          const account = await this.entityManager.findOne(
            Account,
            { stripeCustomerId: customer },
            { relations: ['users'] },
          );
          const user = account.users[0];
          this.segment.track({
            userId: user.id,
            event: 'Trial Started',
            properties: {
              trialStartDate: new Date().toISOString(),
              trialEndDate: trialEnd.toISOString(),
              trialPlanName: plan,
            },
          });
        } catch (e) {
          console.error(e);
        }
      }

      await this.transactionManager.ensureTransactional(
        this.entityManager,
        async (manager) => {
          const account = await this.entityManager.findOne(Account, {
            stripeCustomerId: customer,
          });
          if (status !== 'active')
            this.squareService.disconnect(account.id, manager);

          await this.entityManager.update(Account, account.id, {
            plan,
            planState: status,
            trialEnd,
          });
        },
      );
    }

    return res.status(200).send();
  }

  @Get('plans')
  async getPlanInformation(@Session() { userId }): Promise<any> {
    const plans: any = {};
    const activePlans = await this.stripe.plans.list({
      active: true,
      limit: 20,
      expand: ['data.product'],
    });

    // Newer plans are replaced by older active plans. The old plan must be archived for a new plan to be included in the output
    activePlans.data
      .filter((plan) => {
        const name = (plan.product as any).metadata.plan;
        return name && name !== 'BASIC';
      })
      .sort((a, b) => b.created - a.created)
      .forEach((plan) => {
        const appPlanId = this.getPlanAppId(plan);
        if (!appPlanId) return;
        const { id, amount } = plan;
        plans[appPlanId] = { id, amount };
      });

    const responseData: Record<string, any> = { plans };

    if (userId) {
      const user = await this.entityManager.findOne(User, {
        where: { id: userId },
        relations: ['account'],
      });
      const account = user.account;

      let customer: Stripe.Customer;

      if (!account.stripeCustomerId) {
        customer = await this.billingService.getStripeCustomer(user);
        account.stripeCustomerId = customer.id;
        await this.entityManager.save(account);
      } else {
        const customerOrDeletedCustomer = await this.stripe.customers.retrieve(
          account.stripeCustomerId,
          { expand: ['subscriptions.data.items'] },
        );
        if (customerOrDeletedCustomer.deleted) {
          account.stripeCustomerId = null;
          customer = await this.billingService.getStripeCustomer(user);
        } else {
          customer = customerOrDeletedCustomer as Stripe.Customer;
        }
      }

      const {
        subscriptions: {
          data: [subscription],
        },
      } = customer;
      const hasPaymentMethod = !!customer.invoice_settings
        ?.default_payment_method;

      const { status, trial_end: trialEnd } = subscription ?? {};
      const price = subscription
        ? await this.stripe.prices.retrieve(
            subscription.items.data[0]?.price.id,
            { expand: ['product'] },
          )
        : null;
      const currentPlan =
        (['active', 'past_due', 'incomplete', 'trialing'].includes(status) &&
          (price?.product as Stripe.Product).metadata?.plan) ||
        'NONE';

      const session = await this.stripe.billingPortal.sessions.create({
        customer: account.stripeCustomerId,
      });

      const portalUrl = session.url;

      let trialRemaining: number;
      if (status === 'trialing') trialRemaining = trialEnd * 1000 - Date.now();

      Object.assign(responseData, {
        hasPaymentMethod,
        currentPlan,
        status,
        trialRemaining,
        portalUrl,
      });
    }

    return responseData;
  }

  @Post('subscribe')
  async subscribe(@Body() body: any, @Session() { userId }) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['account'],
    });
    const account = user.account;
    const { plan, promoCode } = body;

    const customer: Stripe.Customer = await this.billingService.getStripeCustomer(
      user,
      body.paymentMethod,
    );

    account.stripeCustomerId = customer.id;
    await this.entityManager.save(account);

    let subscription = customer.subscriptions?.data.filter(
      ({ status }) =>
        status !== 'incomplete' && status !== 'incomplete_expired',
    )[0];

    try {
      if (subscription && plan === 'FREE') {
        await this.stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
      } else if (subscription) {
        // Update existing subscription
        await this.stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: false,
          proration_behavior: 'create_prorations',
          items: [
            {
              id: subscription.items.data[0].id,
              plan,
            },
          ],
          coupon: promoCode,
        });
      } else {
        // Create a new subscription
        subscription = await this.stripe.subscriptions.create({
          customer: customer.id,
          items: [{ plan }],
          expand: ['latest_invoice.payment_intent'],
          coupon: promoCode,
        });
      }
    } catch (err) {
      if (err.message.startsWith('No such coupon'))
        throw new BadRequestException('Invalid Promo Code');
      throw new Error();
    }

    const { id, status } = subscription;
    const { client_secret = undefined, next_action = undefined } =
      ((subscription.latest_invoice as Stripe.Invoice)
        ?.payment_intent as Stripe.PaymentIntent) ?? {};
    return { id, status, client_secret, next_action };
  }

  @Post('info')
  async updateInfo(@Body() body: any, @Session() { userId }) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: ['account'],
    });
    const customer = await this.billingService.getStripeCustomer(user);

    await this.stripe.paymentMethods.attach(body.paymentMethod, {
      customer: customer.id,
    });

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customer.id,
      payment_method: body.paymentMethod,
    });

    const {
      id,
      status,
      next_action,
      client_secret,
    } = await this.stripe.setupIntents.confirm(setupIntent.id);

    await this.stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: body.paymentMethod,
      },
    });

    return { id, status, client_secret, next_action };
  }

  private getPlanAppId({ interval, product }): string {
    if (!product?.metadata?.plan) return '';
    const { plan } = product.metadata; // FREE | BASIC | PREMIUM
    return plan?.toUpperCase() === 'FREE'
      ? (plan as string)
      : `${plan}_${interval}LY`.toUpperCase();
  }

  private async getPlanStripeId(
    planAppId: string,
    activePlans?: Array<Stripe.Plan>,
  ) {
    if (!activePlans)
      activePlans = (await this.stripe.plans.list({ active: true, limit: 20 }))
        .data;
    return activePlans.find((plan) => this.getPlanAppId(plan) === planAppId);
  }
}
