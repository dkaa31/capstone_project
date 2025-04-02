import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req, Get, Res, Query, HttpException, HttpStatus, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import * as path from 'path';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService, private prisma: PrismaService) {}

    @Get('')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async base(){
        throw new ForbiddenException();
    }

    @Post('login')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async login(@Body() body: { phoneNumber: string; password: string }, @Res() res: Response) {
        return this.usersService.login(body.phoneNumber, body.password, res);
    }

    @Get("login")
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async loginGet(){
        throw new ForbiddenException();
    }

    @Post('register')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async register(
        @Body()
        body: {
            name: string;
            email: string;
            phoneNumber: string;
            password: string;
        },
        @Res()
        res: Response
        
    ) {
        return this.usersService.register(
        body.name,
        body.email,
        body.phoneNumber,
        body.password,
        res
        );
    }

    @Get('register')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async registerGet(){
        throw new ForbiddenException();
    }

    @Post('verify')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async verify(@Body() body: { email: string; otp: string }, @Res() res: Response) {
        return this.usersService.verifyAccount(body.email, body.otp, res);
    }

    @Get('verify')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async verifyGet(){
        throw new ForbiddenException();
    }

    @Post("forgot-password")
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async forgotPassword(@Body() body: { email: string }, @Res() res: Response){
        return this.usersService.forgotPassword(body.email, res);
    }

    @Get('forgot-password')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async forgotPasswordGet(){
        throw new ForbiddenException();
    }

    @Post('upload-image-profile')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000}})
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/uploads/imageProfile',
            filename: async (req, file, cb) => {
                const userId = req.user.userId;
                const fileExt = path.extname(file.originalname);
                const newFilename = `${userId}${fileExt}`;
                cb(null, newFilename);
            },
        })
    }))
    async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: any, @Res() res: Response) {
        const userId = req.user.userId;
        return this.usersService.uploadImageProfile(file, userId, res);
    }

    @Get('upload-image-profile')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async uploadImageProfileGet(){
        throw new ForbiddenException();
    }

    @Post('update-user')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000}})
    @UseGuards(AuthGuard('jwt'))
    async updateUser(@Req() req: any, @Res() res: Response){
        const userId = req.user.userId;
        return this.usersService.updateUser(userId, res);
    }

    @Get('update-user')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async updateUserGet(){
        throw new ForbiddenException();
    }

    @Post('verify-update-user')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000}})
    @UseGuards(AuthGuard('jwt'))
    async verifyUpdateUser(@Req() req: any, @Body() body: {otp: string; updateData: Partial<{ name: string; phoneNumber: string; email: string }> }, @Res() res: Response){
        const userId = req.user.userId;
        return this.usersService.verifyUpdateUser(userId, body.otp, body.updateData, res);
    }

    @Get('verify-update-user')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async verifyUpdateUserGet(){
        throw new ForbiddenException();
    }

    @Get("reset-password")
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async resetPasswords(@Res() res: Response, @Query('ticket_id') ticket_id: string){
        if(!ticket_id){
            throw new HttpException('Request not allowed!', HttpStatus.UNAUTHORIZED);
        }

        const findTicketId = await this.prisma.ticketResetPassword.findFirst({
            where: { ticket_id: ticket_id }
        });


        if(!findTicketId){
            return res.render('notfound');
        }

        return res.render('reset-password', { 
            ticket_id: ticket_id, 
            email: findTicketId.email 
        });
    }

    @Post("confirm-reset-password")
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async confirmResetPassword( @Body() body: any, @Res() res: Response){
        return this.usersService.verifyTicket(body.ticket_id, body.email, body.password, res);
    }

    @Get('confirm-reset-password')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60000}})
    async confirmResetPasswordGet(){
        throw new ForbiddenException();
    }

    @Get('test')
    async test(){
        // throw new HttpException('wkkw', HttpStatus.BAD_GATEWAY);
        throw new NotAcceptableException('wkkw');
    }
}
