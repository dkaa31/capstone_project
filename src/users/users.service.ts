import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { ServerClient } from 'postmark';
import { ResponseAPI } from 'src/utils/response';

const client = new ServerClient("7cdfd7df-61e7-4fee-9965-46ec883c5a9e");

@Injectable()
export class UsersService {
    private readonly char: string;
    private readonly symbol: string;
    private readonly letters: string;
    private readonly numbers: string;

	constructor(private prisma: PrismaService) {
        this.letters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        this.numbers = "1234567890";
        this.symbol = `[]{}\|;'"/.>,<!@#$%^&*()_-+=`;
        this.char = this.numbers + this.char + this.letters;
    }

	async login(phoneNumber: string, password: string, res: any){
		try {
            if (!/^\d+$/.test(phoneNumber)) {
                return ResponseAPI("FAILED", "Nomor telepon hanya boleh berupa angka.", HttpStatus.NOT_ACCEPTABLE, res);
            }

			const user = await this.prisma.user.findUnique({
				where: { phoneNumber },
			});

			if (!user) {
                return ResponseAPI("FAILED", "Nomor telepon atau password salah.", HttpStatus.NOT_ACCEPTABLE, res);
			}

            if(user.status === "PENDING"){
                return ResponseAPI("FAILED", "Mohon aktivasi akun terlebih dahulu.", HttpStatus.UNAUTHORIZED, res);
            }
            
            if(user.status === 'SUSPENDED') {
                return ResponseAPI("FAILED", "Akunmu ditangguhkan, hubungi admin.", HttpStatus.UNAUTHORIZED, res);
            }
            
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
                return ResponseAPI("FAILED", "Nomor telepon atau password salah.", HttpStatus.NOT_ACCEPTABLE, res);
			}

			const token = jwt.sign(
				{ userId: user.id, phoneNumber: user.phoneNumber, name: user.name },
				process.env.JWT_SECRET,
				{ expiresIn: '30d' }
			);

            return ResponseAPI("OK", "Login Berhasl.", HttpStatus.OK, res, { id: user.id, phoneNumber: user.phoneNumber, name: user.name }, token);
		} catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal Login", HttpStatus.INTERNAL_SERVER_ERROR, res)
		}
	}

    async register(name: string, email: string, phoneNumber: string, password: string, res: any) {
        try {

            if (/[^a-zA-Z\s]/.test(name)) {
                return ResponseAPI("FAILED", "Nama hanya boleh berupa huruf.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return ResponseAPI("FAILED", "Format email tidak valid.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if (!/^\d+$/.test(phoneNumber)) {
                return ResponseAPI("FAILED", "Nomor telepon hanya boleh berupa angka.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
        
            const findEmail = await this.prisma.user.findFirst({
                select: { email: true },
                where: { email: email }
            });

            if(findEmail){
                return ResponseAPI("FAILED", "Email sudah dipakai.", HttpStatus.NOT_ACCEPTABLE, res);
            }
    
            const findPhoneNumber = await this.prisma.user.findFirst({
                select: { phoneNumber: true },
                where: { phoneNumber: phoneNumber }
            });

            if(findPhoneNumber){
                return ResponseAPI("FAILED", "Nomor telepon sudah dipakai.", HttpStatus.NOT_ACCEPTABLE, res);
            }
            
            if(password.length < 8){
                return ResponseAPI("FAILED", "Password length at least 8 characters.", HttpStatus.NOT_ACCEPTABLE, res);
            }
    
            await this.prisma.user.create({
                data: {
                    name,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                    status: 'PENDING',
                },
            });
    
            return await this.generateOTP(email, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal Membuat Akun", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }

    async generateOTP(email: string, res){
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return ResponseAPI("FAILED", "Format email tidak valid.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            await this.prisma.ticketUser.upsert({
                where: { email },
                update: { otp, expiresAt },
                create: { email, otp, expiresAt, type: 'REGIS', used: "UNUSED" },
            });

            const HtmlBody = `
                <!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Activation Account - OTP Code</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                        }

                        .container {
                            max-width: 600px;
                            margin: 50px auto;
                            background: #fff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        }

                        .header {
                            background: #4CAF50;
                            color: #fff;
                            text-align: center;
                            padding: 20px 10px;
                        }

                        .content {
                            padding: 20px 30px;
                            line-height: 1.6;
                        }

                        .otp {
                            display: inline-block;
                            font-size: 24px;
                            font-weight: bold;
                            color: #4CAF50;
                            background: #f4f4f4;
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }

                        .footer {
                            text-align: center;
                            background: #f4f4f4;
                            padding: 15px 10px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Activation Your Account</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>We received a request to activate your account. Use the code below to proceed. If you didn’t request a, please ignore this email.</p>
                            <div class="otp">${otp}</div>
                                <p>This OTP is valid for 15 minutes.</p>
                                <p>If you have any questions, feel free to contact our support team.</p>
                                <p>Best regards,</p>
                                <p>
                                    <strong>ApiiwDev Team</strong>
                                </p>
                            </div>
                            <div class="footer">
                            <p>&copy; 2025 ApiiDev. All rights reserved.</p>
                        </div>
                    </div>
                </body>

                </html>

            `;

            const info = client.sendEmail({
                "From": "no-reply@apiiwdev.my.id",
                "To": email,
                "Subject": "Kode OTP",
                "HtmlBody": HtmlBody,
                "TextBody": `Kode OTP Anda adalah: ${otp}`,
            });

            return ResponseAPI("OK", `Mohon cek email: ${email}, kode OTP berlaku 15 menit. ${info}`, HttpStatus.CREATED, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal membuat OTP Code.", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
        
    }

    async verifyAccount(email: string, otp: string, res: any) {
        try {

            const activation = await this.prisma.ticketUser.findUnique({
                where: { email }
            })

            if (!activation) {
                return ResponseAPI("FAILED", "OTP tidak ditemukan.", HttpStatus.BAD_REQUEST, res);
            }

            if (activation.expiresAt < new Date() || activation.used == 'USED') {
                return ResponseAPI("FAILED", "OTP sudah kedaluwarsa.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if (activation.otp !== otp || activation.type !== 'REGIS') {
                return ResponseAPI("FAILED", "OTP Salah.", HttpStatus.BAD_REQUEST, res);
            }

            await this.prisma.ticketUser.delete({
                where: { otp },
            })

            await this.prisma.user.update({
                where: { email },
                data: { status: 'ACTIVE' },
            });

            return ResponseAPI("OK", "OTP Valid", HttpStatus.OK, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || 'Gagal Verifikasi.', HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }

    async forgotPassword(email: string, res: any){
        try {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let ticket_id = '';

            for (let i = 0; i < 150; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                ticket_id += chars[randomIndex];
            }

            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            const api_url = process.env.API_URL;

            if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return ResponseAPI("FAILED", "Format email tidak valid.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            await this.prisma.ticketResetPassword.upsert({
                where: { email },
                update: { ticket_id, expiresAt },
                create: { email, expiresAt, ticket_id }
            })

            const HtmlBody = `
                <!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Forgot Password - OTP Code</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                        }

                        .container {
                            max-width: 600px;
                            margin: 50px auto;
                            background: #fff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        }

                        .header {
                            background: #4CAF50;
                            color: #fff;
                            text-align: center;
                            padding: 20px 10px;
                        }

                        .content {
                            padding: 20px 30px;
                            line-height: 1.6;
                        }

                        .reset-button {
                            display: inline-block;
                            font-size: 20px;
                            font-weight: 700;
                            color: #fff;
                            background:#4CAF50;
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin: 10px 0;
                            border: none;
                            text-decoration: none;
                        }

                        .footer {
                            text-align: center;
                            background: #f4f4f4;
                            padding: 15px 10px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Reset Your Password</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Use the lik below to proceed. If you didn’t request a password reset, please ignore this email.</p>
                            <a href="${api_url}/users/reset-password?ticket_id=${ticket_id}" class="reset-button">Reset Password</a>
                            <p>This Link is valid for 15 minutes.</p>
                            <a href="${api_url}/users/reset-password?ticket_id=${ticket_id}">${api_url}/users/reset-password?ticket_id=${ticket_id}</a>
                            <p>If you have any questions, feel free to contact our support team.</p>
                            <p>Best regards,</p>
                            <p>
                                <strong>ApiiwDev Team</strong>
                            </p>
                            </div>
                            <div class="footer">
                            <p>&copy; 2025 ApiiDev. All rights reserved.</p>
                        </div>
                    </div>
                </body>

                </html>
            `;

            const info = client.sendEmail({
                "From": "no-reply@apiiwdev.my.id",
                "To": email,
                "Subject": "Reset Password Link",
                "HtmlBody": HtmlBody,
                "TextBody": `Request Reset Passowrd`,
            });

            return ResponseAPI("OK", `Berhasil membuat permintaan, Mohon cek email: ${email}.`, HttpStatus.CREATED, res, info);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal mengubah password.", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }

    async verifyTicket(ticket_id: string, email: string, password: string, res: any){
        try {
            const findTicket = await this.prisma.ticketResetPassword.findUnique({
                where: { email }
            })

            if(!findTicket){
                return ResponseAPI("FAILED", "Ticket tidak ditemukan.", HttpStatus.NOT_FOUND, res);
            }

            if (findTicket.expiresAt < new Date()) {
                return ResponseAPI("FAILED", "Link sudah kedaluwarsa.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if(findTicket.ticket_id !== ticket_id) {
                return ResponseAPI("FAILED", "Ticket salah.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if(password.length < 8){
                return ResponseAPI("FAILED", "Password length at least 8 characters.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await this.prisma.ticketResetPassword.delete({
                where: { ticket_id },
            })

            await this.prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });

            return ResponseAPI("OK", "Password berhasil diubah.", HttpStatus.OK, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal Verifikasi.", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }
 
    async uploadImageProfile(file: Express.Multer.File, userId: string, res: any){
        try {
            if (!file) {
                return ResponseAPI("FAILED", "File tidak ditemukan.", HttpStatus.NOT_FOUND, res);
            }
    
            const fileExtension = file.originalname.split('.').pop();
            const newFilename = `${userId}.${fileExtension}`;
    
            await this.prisma.user.update({
                where: { id: userId },
                data: { picture: newFilename },
            });
    
            return ResponseAPI("OK", "Foto profil berhasil diunggah", HttpStatus.CREATED, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal Upload", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }

    async updateUser(userId: string, res: any){
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            const findUser = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if(!findUser){
                return ResponseAPI("FAILED", "User not found.", HttpStatus.NOT_FOUND, res);
            }

            await this.prisma.ticketUser.upsert({
                where: { email: findUser.email },
                update: { otp, expiresAt },
                create: { email: findUser.email, otp, expiresAt, type: "UPDATE" }
            })

            const HtmlBody = `
                <!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Forgot Password - OTP Code</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            color: #333;
                        }

                        .container {
                            max-width: 600px;
                            margin: 50px auto;
                            background: #fff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        }

                        .header {
                            background: #4CAF50;
                            color: #fff;
                            text-align: center;
                            padding: 20px 10px;
                        }

                        .content {
                            padding: 20px 30px;
                            line-height: 1.6;
                        }

                        .otp {
                            display: inline-block;
                            font-size: 24px;
                            font-weight: bold;
                            color: #4CAF50;
                            background: #f4f4f4;
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }

                        .footer {
                            text-align: center;
                            background: #f4f4f4;
                            padding: 15px 10px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Reset Your Password</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Use the code below to proceed. If you didn’t request a password reset, please ignore this email.</p>
                            <div class="otp">${otp}</div>
                                <p>This OTP is valid for 15 minutes.</p>
                                <p>If you have any questions, feel free to contact our support team.</p>
                                <p>Best regards,</p>
                                <p>
                                    <strong>ApiiwDev Team</strong>
                                </p>
                            </div>
                            <div class="footer">
                            <p>&copy; 2025 ApiiDev. All rights reserved.</p>
                        </div>
                    </div>
                </body>

                </html>

            `;

            const info = client.sendEmail({
                "From": "no-reply@apiiwdev.my.id",
                "To": findUser.email,
                "Subject": "Kode OTP",
                "HtmlBody": HtmlBody,
                "TextBody": `Kode OTP Anda adalah: ${otp}`,
            });

            return ResponseAPI("OK", `Mohon cek email: ${findUser.email}, kode OTP Berlaku 15 menit. ${info}`, HttpStatus.CREATED, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal mengupdate", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }

    async verifyUpdateUser(userId: string, otp: string, data: Partial<{ name: string, phoneNumber: string, email: string}>, res: any){
        try {
            const findTicket = await this.prisma.ticketUser.findUnique({
                where: { otp }
            });

            if(!findTicket){
                return ResponseAPI("FAILED", "OTP tidak ditemukan.", HttpStatus.NOT_FOUND, res);
            }

            if (findTicket.expiresAt < new Date() || findTicket.used == 'USED') {
                return ResponseAPI("FAILED", "OTP sudah kedaluwarsa.", HttpStatus.NOT_ACCEPTABLE, res);
            }

            if (findTicket.otp !== otp || findTicket.type !== 'UPDATE') {
                return ResponseAPI("FAILED", "OTP salah.", HttpStatus.BAD_REQUEST, res);
            }

            await this.prisma.ticketUser.update({
                where: { otp },
                data: {
                    used: 'USED'
                }
            });

            await this.prisma.user.update({
                where: { id: userId},
                data
            });

            return ResponseAPI("OK", "Data berhasil diubah.", HttpStatus.OK, res);
        } catch (err) {
            return ResponseAPI("FAILED", err.message || "Gagal Update User", HttpStatus.INTERNAL_SERVER_ERROR, res);
        }
    }
}
