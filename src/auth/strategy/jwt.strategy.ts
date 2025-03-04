import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy , 'jwt') {
    constructor(private prisma: PrismaService, private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    if (req && req.cookies) {
                        return req.cookies['access_token'];
                    }
                    return null;
                },
            ]), 
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default', //undefined対策で初期値を設定
        });
    }

    async validate(payload: { sub: number; email: string }) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
        });

        if (!user) {
            return null;
        }

        const { hashedPassword, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}