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

const TargetOrder = Object.values(Target);

export const compareTargetFn = (a: Target, b: Target) => {
    return TargetOrder.indexOf(a) - TargetOrder.indexOf(b)
};

registerEnumType(Target, {
    name: "Target",
});