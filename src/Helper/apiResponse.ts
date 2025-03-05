class ApiResponse {

    statusCode: number;
    message: string;
    data: any;
    success: boolean;


    constructor(statusCode: number, message: string, data: any) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
    }
}

export {ApiResponse}