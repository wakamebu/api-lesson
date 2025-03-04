import { Controller , Body , Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getLoginUser(@Req() req: Request): Omit<User, 'hashedPassword'> {
        return req.user as Omit<User, 'hashedPassword'>;
    }

    @Patch()
    updateUser(
        @Req() req: Request,
        @Body() dto: UpdateUserDto
    ): Promise<Omit<User, 'hashedPassword'>> {

        //req.userがundefinedの場合を考慮する必要がある
        if (!req.user) {
            throw new Error('User not found');
        }

        return this.userService.updateUser(req.user.id, dto);
    }
}
