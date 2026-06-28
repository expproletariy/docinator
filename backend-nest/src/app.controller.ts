import { Controller, Get, Req, Query, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('document')
  getDocument(@Query('documentId') documentId: string): unknown {
    console.warn('query', parseInt(documentId), typeof documentId);
    // todo: как правильно и безопасно парсить параметры?
    return this.appService.getDocument(parseInt(documentId));
  }
}
