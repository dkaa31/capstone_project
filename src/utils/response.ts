export const ResponseAPI = (status: "OK" | "FAILED", message: string, statusCode: number = 200, res: any, user?: object, token?: string) => {
    if(status == 'OK'){
        return res.status(statusCode).json({
            data: {
                message: message,
                statusCode: statusCode,
                ...(user && { user }),
                ...(token && { token })
            }
        });
    } else {
        return res.status(statusCode).json({
            error: {
                message: message,
                statusCode: statusCode
            }
        });
    }
}