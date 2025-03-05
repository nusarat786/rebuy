
const getUnixTimestampMs = (date: Date): number => {
    return date.getTime(); // Returns milliseconds
};

const currentUnixTimestampMs = (): number => {
    return new Date().getTime();
};

export  {getUnixTimestampMs, currentUnixTimestampMs};



