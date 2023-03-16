import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Res } from '@nestjs/common';
import { error } from 'console';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { throwError } from 'rxjs';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }
    let req = await this.validateToken(request.headers.authorization);
    return true
  }

  async validateToken(auth: string, @Res() res?: Response) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new Error('Invalid token');
    }
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET,function(err,decoded){
        if(err)
        {
          throw new Error(err);
        }
      });
      return decoded;
    } catch (err) {
      const message =  (err.message || err.name);
      throw new UnauthorizedException(message);
    }
  }
}
