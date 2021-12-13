export function propertyToTitleCase(property: string): string {
    const result = property.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}