import { Module } from '@nestjs/common';
import { GlService } from './gl.service';
import { GlController } from './gl.controller';

@Module({ controllers: [GlController], providers: [GlService], exports: [GlService] })
export class GlModule {}
