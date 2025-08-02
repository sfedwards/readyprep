import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { SandboxService } from './sandbox.service';

@Controller('sandbox')
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @UseGuards(LoggedInGuard)
  @Post('leave')
  async leaveSandbox(
    @Body() { reset }: { reset: boolean },
    @Session() { accountId },
  ) {
    await this.sandboxService.leave(accountId, reset);
    return {};
  }
}
