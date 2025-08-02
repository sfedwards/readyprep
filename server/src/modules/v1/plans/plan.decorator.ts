import { SetMetadata } from '@nestjs/common';

import { Account } from '../accounts/account.entity';

export const Plan = (plan: Account['plan']) => SetMetadata('plan', plan);
