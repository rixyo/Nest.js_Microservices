import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { OrdersResolver } from './orders.resolver';
import { DatabaseModule } from './datasource/datasource.module';
import { GraphQLUserInterceptor, RmqModule, UserModule } from '@app/common';
import { BILLING_SERVICE } from './constants/services';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import * as Joi from 'joi';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/orders/.env',
      validationSchema: Joi.object({
        DTABASE_URL: Joi.string().required(),
      }),
    }),
    RmqModule.register({
      name: BILLING_SERVICE,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    DatabaseModule,
    UserModule,
    TypeOrmModule.forFeature([Order]),
  ],
  providers: [
    OrdersService,
    OrdersResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLUserInterceptor,
    },
  ],
})
export class OrdersModule {}
