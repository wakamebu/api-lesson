import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async updateUser(userId: number, dto: UpdateUserDto): Promise<Omit<User, 'hashedPassword'>> {
        const user = await this.prisma.user.update({
            where: {
                id : userId,
            },
            data: {
                ...dto,
            },
        });

        const userWithoutPassword: Omit<User, 'hashedPassword'> = { ...user };
        delete (userWithoutPassword as Partial<User>).hashedPassword;

        return userWithoutPassword;
    }
}
