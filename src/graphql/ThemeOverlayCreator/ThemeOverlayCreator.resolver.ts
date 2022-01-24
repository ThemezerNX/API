import {Args, Query, Resolver} from "@nestjs/graphql";
import {ThemeOverlayCreatorModel} from "./ThemeOverlayCreator.model";
import {ThemeOverlayCreatorService} from "./ThemeOverlayCreator.service";
import {CreateOverlayThemesArgs} from "./dto/CreateOverlayThemes.args";
import {FileModel} from "../common/models/File.model";
import {CreateOverlayArgs} from "./dto/CreateOverlay.args";


@Resolver(ThemeOverlayCreatorModel)
export class ThemeOverlayCreatorResolver {

    constructor(
        private themeOverlayCreatorService: ThemeOverlayCreatorService,
    ) {
    }

    @Query(() => [FileModel], {
        description: "Create a black and white nxtheme used to create an overlay. The piece may not contain vairable fields ('??{ }??'). You must fill these in with an example value.",
    })
    async createOverlayThemes(
        @Args() createOverlayThemesArgs: CreateOverlayThemesArgs,
    ): Promise<FileModel[]> {
        const themes = this.themeOverlayCreatorService.createThemes(
            createOverlayThemesArgs.layoutJson,
            createOverlayThemesArgs.pieceJson,
            createOverlayThemesArgs.commonLayoutJson,
        );
        return themes.map(theme => new FileModel(theme.fileName, theme.data.toString("base64"), theme.mimetype));
    }

    @Query(() => FileModel, {
        description: "Create an overlay from two screenshots.",
    })
    async createOverlay(
        @Args() {blackImage, whiteImage}: CreateOverlayArgs,
    ): Promise<FileModel> {
        const theme = await this.themeOverlayCreatorService.createOverlay(
            (await blackImage).createReadStream,
            (await whiteImage).createReadStream,
        );
        return new FileModel(theme.fileName, theme.data, theme.mimetype);
    }

}
