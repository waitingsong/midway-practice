import { Config, Middleware, App } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { IMidwayWebApplication } from '@midwayjs/web';
import { NextFunction, Context } from '@midwayjs/koa';

import { IAccessLogConfig } from '../../interface';

@Middleware()
export class AccessLogMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('accessLogConfig')
  accessLogConfig: IAccessLogConfig;

  @App()
  app: IMidwayWebApplication;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const { url } = ctx.request;
      const { ignore } = this.accessLogConfig;
      // 只有有一个符合条件
      const exist = ignore.find(item => item.test(url));
      if (exist) return await next();
      const requestBody =
        ctx.request.method === 'GET'
          ? ctx.request.query
          : ctx.request.body || {};
      // 输出请求日志
      ctx.logger.info('requestQuery %j', requestBody);
      await next();
      const { body } = ctx;
      ctx.logger.info('responseBody %j', body);
    };
  }
}
