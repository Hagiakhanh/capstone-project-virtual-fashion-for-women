export default function formatDate(dateString?: string): string {
    if (!dateString) return '';

    const normalized = dateString.replace('T', ' ');

    const [datePart, timePartRaw] = normalized.split(' ');
    if (!datePart || !timePartRaw) return dateString;

    const [year, month, day] = datePart.split('-');

    const [hours, minutes] = timePartRaw.split(':');

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}