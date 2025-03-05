import { Request } from 'express';

const getClientIp = (req: Request): string => {
    // Extract the X-Forwarded-For header
    const forwarded = req.headers['x-forwarded-for'] as string | undefined;

    if (forwarded) {
        // Split the header into an array of IPs and return the first one
        const ipList = forwarded.split(',').map(ip => ip.trim());
        return ipList[0]; // First IP is the client's real IP
    }

    // Fallback to req.ip
    return req.ip || "";
};

export default getClientIp;
