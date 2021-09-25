import {Args, ArgsType, Field, Query, Resolver} from "@nestjs/graphql";
import {NXInstallerModel, NXInstallerTheme} from "./NXInstaller.model";
import {ThemeService} from "../Theme/Theme.service";
import {PackService} from "../Pack/Pack.service";
import {SortOrder} from "../common/enums/SortOrder";
import {ItemSort} from "../common/args/ItemSortArgs";
import {PaginationArgs} from "../common/args/Pagination.args";
import {ThemeEntity} from "../Theme/Theme.entity";
import {MinLength} from "class-validator";
import {SortInterface} from "../common/interfaces/Sort.interface";

export const themeHexREGEX = /^t[0-9a-f]+$/;
export const packHexREGEX = /^p[0-9a-f]+$/;

@ArgsType()
class QueryArgs extends SortInterface {

    @Field()
    @MinLength(1)
    id: string;

}

@Resolver(NXInstallerModel)
export class NXInstallerResolver {

    constructor(
        private themeService: ThemeService,
        private packService: PackService,
    ) {
    }

    private static mapTheme({id, name, target, previews, downloadUrl}: ThemeEntity) {
        const nxtheme = new NXInstallerTheme();
        nxtheme.id = id;
        nxtheme.name = name;
        nxtheme.target = target;
        nxtheme.url = downloadUrl;
        nxtheme.preview = previews.image720Url;
        nxtheme.thumbnail = previews.image240Url;

        return nxtheme;
    }

    @Query(() => NXInstallerModel, {
        description: `A special query that formats data specifically for the NXThemesInstaller HomeBrew Application`,
    })
    async nxinstaller(
        @Args() {id}: QueryArgs,
    ): Promise<NXInstallerModel> {
        const idLower = id.toLowerCase();
        const response = new NXInstallerModel();

        if (themeHexREGEX.exec(idLower)) {
            // Download theme
            const themeId = idLower.substring(1);
            const theme = await this.themeService.findOne({id: themeId});

            response.themes = [NXInstallerResolver.mapTheme(theme)];
        } else if (packHexREGEX.exec(idLower)) {
            // Download pack
            const packId = idLower.substring(1);
            const pack = await this.packService.findOne({id: packId}, ["themes"]);

            response.groupname = pack.name;
            response.themes = pack.themes.map(NXInstallerResolver.mapTheme);
        } else if (idLower == "__special_random") {
            // A few random themes
            const themes = await this.themeService.findRandom({limit: 3});

            response.themes = themes.map(NXInstallerResolver.mapTheme);
        } else if (idLower == "__special_recent") {
            // Recently added themes
            const {result: themes} = await this.themeService.findAll({
                paginationArgs: new PaginationArgs(12),
                order: SortOrder.DESC,
                sort: ItemSort.ADDED,
            });

            response.themes = themes.map(NXInstallerResolver.mapTheme);
        } else {
            // Search
            const {result: themes} = await this.themeService.findAll({
                paginationArgs: new PaginationArgs(12),
                query: idLower,
            });

            response.themes = themes.map(NXInstallerResolver.mapTheme);
        }

        return response;
    }

}
