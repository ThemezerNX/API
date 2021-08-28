import {registerEnumType} from "@nestjs/graphql";

export enum Target {
    ResidentMenu = "ResidentMenu",
    Entrance = "Entrance",
    Flaunch = "Flaunch",
    Set = "Set",
    Psl = "Psl",
    MyPage = "MyPage",
    Notification = "Notification",
}

registerEnumType(Target, {
    name: "Target",
});