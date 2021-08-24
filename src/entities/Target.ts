import {registerEnumType} from "type-graphql";

export enum Target {
    RESIDENTMENU = "ResidentMenu",
    ENTRANCE = "Entrance",
    FLAUNCH = "Flaunch",
    SET = "Set",
    PSL = "Psl",
    MYPAGE = "MyPage",
    NOTIFICATION = "Notification",
}

registerEnumType(Target, {
    name: "Target"
});