export interface IsOwner {

    isOwner(itemId: string, userId: string): Promise<boolean>;

}