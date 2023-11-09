import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { InteractionsDefinitionUsecase } from '../../usecase/cms.usecase';
import { CMSWebhookAPI } from './types/cms/CMSWebhookAPI';

@Controller()
@ApiTags('Webhooks CMS')
export class CMSController {
  constructor(
    private readonly interactionsDefinitionUsecase: InteractionsDefinitionUsecase,
  ) {}
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @ApiBody({ type: CMSWebhookAPI })
  @Post('api/cms/income')
  async income(
    @Body() body: CMSWebhookAPI,
    @Headers('Authorization') authorization: string,
  ) {
    if (
      !authorization ||
      !authorization.endsWith(process.env.CMS_WEBHOOK_API_KEY)
    ) {
      throw new ForbiddenException('API KEY webhook CMS incorrecte : ');
    }
    console.log(JSON.stringify(body));
    await this.interactionsDefinitionUsecase.manageIncomingCMSData(
      body,
    );
  }
}
