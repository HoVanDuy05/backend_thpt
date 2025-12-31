import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { VaiTro } from '@prisma/client';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
    constructor(private reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Check for @Public decorator
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // 1.5. Bypass for Swagger
        const request = context.switchToHttp().getRequest();
        const path = request.url;
        if (path.startsWith('/api/docs') || path.startsWith('/api/docs-json')) {
            return true;
        }

        // console.log('RolesGuard: Checking path', path, request.headers?.authorization ? 'Has Auth Header' : 'No Auth Header');

        // 2. Validate JWT (AuthGuard logic)
        // This executes the JwtStrategy.validate()
        const canActivate = await super.canActivate(context);
        if (!canActivate) {
            return false;
        }

        // 3. Check for @Roles decorator
        const requiredRoles = this.reflector.getAllAndOverride<VaiTro[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // If no roles required, just being logged in is enough
        }

        const { user } = context.switchToHttp().getRequest();
        // user.role comes from JwtStrategy
        return requiredRoles.some((role) => user.role === role);
    }

    // Handle errors from AuthGuard
    handleRequest(err, user, info) {
        if (err || !user) {
            // console.log('RolesGuard: Unauthorized', { err, user, info: info?.message });
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
