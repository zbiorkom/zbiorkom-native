export const msToTime = (ms: number, withSeconds?: boolean) => {
    const formattedTime: string[] = [];

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    if (hours > 0) formattedTime.push(`${hours} h`);
    if (remainingMinutes > 0) formattedTime.push(`${remainingMinutes} min`);
    if (withSeconds) formattedTime.push(`${remainingSeconds} s`);

    return formattedTime.join(" ");
};
