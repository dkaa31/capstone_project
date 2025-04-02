import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule,
    ThrottlerModule.forRoot({
        throttlers: [
            {
              ttl: 60000,
              limit: 10,
              blockDuration: 60000
            },
        ],
    })  
  ],
  controllers: [AppController, ],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
})
export class AppModule {}
