import { Injectable , ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import {JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService
    ) {}
    async signUp(dto: AuthDto):Promise<Msg> {
        const hashed = await bcrypt.hash(dto.password, 12);
            try {
                await this.prisma.user.create({
                    data: {
                        email: dto.email,
                        hashedPassword: hashed,
                    },
                });
                return { 
                    message: 'ok' 
                };
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Email already exists');
                }
            }
            throw error;
        }
    }

    async login(dto: AuthDto): Promise<Jwt> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) {
            throw new ForbiddenException('Email or password incorrect');
        }
        const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
        if (!isValid) {
            throw new ForbiddenException('Email or password incorrect');
        }
        return this.generateJwt(user.id, user.email);
    }

    async generateJwt(userID: number,email: string): Promise<Jwt> {
        const payload = { 
            sub: userID,
            email
        };

        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            secret,
            expiresIn: '5m',
        });
        return {
            accessToken: token,
        };
    }
}
