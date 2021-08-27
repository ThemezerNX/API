import {registerEnumType} from "@nestjs/graphql";

export enum Target {
    RESIDENTMENU = "ResidentMenu",
    ENTRANCE = "Entrance",
    FLAUNCH = "Flaunch",
    SET = "Set",
    PSL = "Psl",
    MYPAGE = "MyPage",
    NOTIFICATION = "Notification",
    HBMENU = "HBMenu"
}

registerEnumType(Target, {
    name: "Target",
});