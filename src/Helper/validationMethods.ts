import { IAdmin, Role } from '../Model/AdminModel';

export function validateEventLog(eventLogToAdd : any,checkRequired:boolean=false): void {


    if(checkRequired){

        
        if (!eventLogToAdd.eventId) {
            throw new Error("eventId is required and cannot be empty.");
        }
        

        if (!eventLogToAdd.eventName) {
            throw new Error("eventName is required and cannot be empty.");
        }

        if (!eventLogToAdd.eventNumber) {
            throw new Error("eventNumber is required and cannot be empty.");
        }

        if (!eventLogToAdd.eventDate) {
            throw new Error("eventDate is required and cannot be empty.");
        }

        if (!eventLogToAdd.eventStartTime) {
            throw new Error("eventStartTime is required and cannot be empty.");
        }
    }


    // Validate eventName length
    if (eventLogToAdd.eventName && eventLogToAdd.eventName.length > 200) {
        throw new Error("eventName cannot be more than 200 characters.");
    }

    // Validate eventNumber length
    if (eventLogToAdd.eventNumber && eventLogToAdd.eventNumber.length > 200) {
        throw new Error("eventNumber cannot be more than 200 characters.");
    }

    // Validate eventType length
    if (eventLogToAdd.eventType && eventLogToAdd.eventType.length > 200) {
        throw new Error("eventType cannot be more than 200 characters.");
    }

    // Validate totalAttendees
    if (eventLogToAdd.totalAttendees && eventLogToAdd.totalAttendees < 0) {
        throw new Error("totalAttendees cannot be less than 0.");
    }

    // Validate totalHost
    if (eventLogToAdd.totalHost && eventLogToAdd.totalHost < 0) {
        throw new Error("totalHost cannot be less than 0.");
    }

    // Validate totalKickout
    if (eventLogToAdd.totalKickout && eventLogToAdd.totalKickout < 0) {
        throw new Error("totalKickout cannot be less than 0.");
    }

    // Validate totalRaisedHand
    if (eventLogToAdd.totalRaisedHand && eventLogToAdd.totalRaisedHand < 0) {
        throw new Error("totalRaisedHand cannot be less than 0.");
    }

    // Validate totalWaveHand
    if (eventLogToAdd.totalWaveHand && eventLogToAdd.totalWaveHand < 0) {
        throw new Error("totalWaveHand cannot be less than 0.");
    }

    // Validate totalThumbsup
    if (eventLogToAdd.totalThumbsup && eventLogToAdd.totalThumbsup < 0) {
        throw new Error("totalThumbsup cannot be less than 0.");
    }

    // Validate eventEndTime
    if (eventLogToAdd.eventEndTime && eventLogToAdd.eventEndTime < eventLogToAdd.eventStartTime) {
        throw new Error("eventEndTime cannot be less than eventStartTime.");
    }
}


export function validateUserLoginLog(userLoginLog: any, checkRequired: boolean = false): void {
    //console.log(userLoginLog)
    const allowedDeviceSources = [
        'Web',
        'IOS',
        'Android',
        'Window_PCApp',
        'Mac_PCApp',
        'Linux_PCApp',
    ];

    if (checkRequired) {
        if (!userLoginLog.userId) {
            throw new Error("userId is required and cannot be empty.");
        }
        if (!userLoginLog.username) {
            throw new Error("username is required and cannot be empty.");
        }
        if (!userLoginLog.loginTime) {
            //throw new Error("loginTime is required and cannot be empty.");
            userLoginLog.loginTime = new Date().toISOString();
            
        }
        if(!userLoginLog.deviceSource){
            throw new Error("deviceSource is required and cannot be empty.");
        }

        if(!userLoginLog.ipAddress){
            throw new Error("ipAddress is required and cannot be empty.");
        }
    }

    
    // Validate username length
    if (userLoginLog.username && userLoginLog.username?.length > 100) {
        throw new Error("username cannot be more than 100 characters.");
    }

    // Validate ipAddress length
    if (userLoginLog.ipAddress && userLoginLog.ipAddress?.length > 100) {
        throw new Error("ipAddress cannot be more than 100 characters.");
    }

   
    // Validate loginStatus
    if (typeof userLoginLog.loginStatus !== 'undefined' && typeof userLoginLog.loginStatus !== 'boolean') {
        throw new Error("loginStatus must be a boolean value.");
    }

    // Validate logoutTime
    if (userLoginLog.logoutTime && userLoginLog.logoutTime < userLoginLog.loginTime) {
        throw new Error("logoutTime cannot be less than loginTime.");
    }

    if (userLoginLog.postalCode &&
        (userLoginLog.postalCode?.length > 11 || userLoginLog.postalCode?.length < 3)
    ) {
        throw new Error("Postal code must be between 3 and 11 characters");
    }
      
    if(userLoginLog.isp && userLoginLog.isp?.length > 500){
        throw new Error("isp cannot be more than 500 characters.");
    }

    if(userLoginLog.deviceSource &&allowedDeviceSources.indexOf(userLoginLog.deviceSource) === -1){
        throw new Error("deviceSource must be one of the following: Web, IOS, Android, Window_PCApp, Mac_PCApp, Linux_PCApp");
    }
}



export function validateAdmin(admin: any, checkRequired: boolean = false): void {
    const allowedRoles = [Role.ADMIN, Role.SUPERADMIN];

    if (checkRequired) {
        if (!admin.adminName) {
            throw new Error("adminName is required and cannot be empty.");
        }
        if (!admin.adminEmail) {
            throw new Error("adminEmail is required and cannot be empty.");
        }
        if (!admin.password) {
            throw new Error("password is required and cannot be empty.");
        }
        if (!admin.role) {
            throw new Error("role is required and cannot be empty.");
        }
    }

    // Validate adminName length
    if (admin.adminName && admin.adminName?.length > 50) {
        throw new Error("adminName cannot be more than 50 characters.");
    }

    // Validate adminEmail format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,64}$/;
    if (admin.adminEmail && !emailRegex.test(admin.adminEmail)) {
        throw new Error("adminEmail must be a valid email address.");
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (admin.password && !passwordRegex.test(admin.password)) {
        throw new Error("password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.");
    }

    // Validate role
    if (admin.role && !allowedRoles.includes(admin.role)) {
        throw new Error("role must be one of the following: ADMIN, SUPERADMIN.");
    }
}


export function validateCategory(category: any, checkRequired: boolean = false): void {
    if (checkRequired) {
        if (!category.name) {
            throw new Error("name is required and cannot be empty.");
        }
        if (!category.description) {
            throw new Error("description is required and cannot be empty.");
        }
    }
}

// if(eventLogToAdd.eventName && eventLogToAdd.eventName.length > 200){
//     throw new Error("eventName can not be more than 200 characters");
// }

// if(eventLogToAdd.eventNumber.length > 200){
//     throw new Error("eventNumber can not be more than 200 characters");
// }

// if(eventLogToAdd.eventType.length > 200){
//     throw new Error("eventType can not be more than 200 characters");
// }

// if(eventLogToAdd.totalAttendees && eventLogToAdd.totalAttendees < 0){
//     throw new Error("totalAttendees can not be less than 0");
// }

// if(eventLogToAdd.totalHost && eventLogToAdd.totalHost < 0){
//     throw new Error("totalHost can not be less than 0");
// }

// if(eventLogToAdd.totalKickout && eventLogToAdd.totalKickout < 0){
//     throw new Error("totalKickout can not be less than 0");
// }

// if(eventLogToAdd.totalRaisedHand && eventLogToAdd.totalRaisedHand < 0){
//     throw new Error("totalRaisedHand can not be less than 0");
// }

// if(eventLogToAdd.totalWaveHand && eventLogToAdd.totalWaveHand < 0){
//     throw new Error("totalWaveHand can not be less than 0");
// }

// if(eventLogToAdd.totalThumbsup && eventLogToAdd.totalThumbsup < 0){
//     throw new Error("totalThumbsup can not be less than 0");
// }

// if(eventLogToAdd.eventEndTime && eventLogToAdd.eventEndTime < eventLogToAdd.eventStartTime){
//     throw new Error("eventEndTime can not be less than eventStartTime");
// }