import { Injectable, Inject } from '@nestjs/common';
import { User } from '../users/user.entity';
import Stripe from 'stripe';
import { INITIAL_TRIAL_LENGTH } from '../plans/plans.service';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Account } from '../accounts/account.entity';

@Injectable()
export class BillingService {
  constructor(@Inject('Stripe') private readonly stripe: Stripe) {}

  // Retrieve or create a Customer in Stripe
  @Transactional()
  public async getStripeCustomer(user: User, paymentMethod?: string) {
    if (user.account.stripeCustomerId) {
      const customer = await this.stripe.customers.retrieve(
        user.account.stripeCustomerId,
        {
          expand: ['subscriptions'],
        },
      );
      if (!customer.deleted) return customer as Stripe.Customer;
    }

    const customer = await this.stripe.customers.create({
      payment_method: paymentMethod,
      metadata: {
        AccountId: user.account.id,
      },
      name: user.name,
      email: user.email,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });

    try {
      const prices = await this.getPlans();

      await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: prices['PREMIUM_MONTHLY'].id }],
        trial_end: Math.ceil(
          Date.now() / 1000 +
            (process.env.NODE_ENV === 'development'
              ? 600
              : INITIAL_TRIAL_LENGTH * 24 * 60 * 60),
        ),
      });
    } catch {}

    const manager = Transactional.getManager();
    await manager.update(Account, user.accountId, {
      stripeCustomerId: customer.id,
    });

    return customer;
  }

  public async getPlans() {
    const plans = {};

    const activePrices = await this.stripe.prices.list({
      active: true,
      limit: 20,
      expand: ['data.product'],
    });

    // Newer plans are replaced by older active plans. The old plan must be archived for a new plan to be included in the output
    activePrices.data
      .sort((a, b) => b.created - a.created)
      .forEach((price) => {
        const { plan } = (price.product as Stripe.Product).metadata;
        const { interval } = price.recurring;
        const appPlanId = `${plan}_${interval}LY`.toUpperCase();
        const { id, unit_amount } = price;
        plans[appPlanId] = { id, amount: unit_amount };
      });

    return plans;
  }
}
