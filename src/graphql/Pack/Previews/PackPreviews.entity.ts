import {AfterLoad, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";
import {PreviewsEntityInterface} from "../../common/interfaces/Previews.entity.interface";
import {CDNMapper} from "../../common/CDNMapper";
import {PackEntity} from "../Pack.entity";
import * as sharp from "sharp";
import {compareTargetFn} from "../../common/enums/Target";
import {ThemeEntity} from "../../Theme/Theme.entity";
import {HBThemeEntity} from "../../HBTheme/HBTheme.entity";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const CANVAS_BLUR = 18;
const PREVIEW_WIDTH = 560;
const PREVIEW_HEIGHT = 315;
const PREVIEW_RADIUS = 30;
const MAIN_COLOR = "#00D079";
const SECONDARY_COLOR = "#E900A4";

const roundedCorners = Buffer.from(
    `<svg>
        <rect x="0" y="0" width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" rx="${PREVIEW_RADIUS}" ry="${PREVIEW_RADIUS}"/>
    </svg>`,
);

const backgroundGradient = Buffer.from(
    `
    <svg>
      <defs>
        <linearGradient id="myGradient" gradientTransform="rotate(45)">
          <stop offset="30%"  stop-color="${MAIN_COLOR}" />
          <stop offset="200%" stop-color="${SECONDARY_COLOR}" />
        </linearGradient>
      </defs>
    
      <!-- using my linear gradient -->
      <rect x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="url('#myGradient')" />
    </svg>
`,
);

const IMAGE_POSITIONS = {
    "2": [
        {
            left: 53,
            top: Math.floor(CANVAS_HEIGHT / 2 - PREVIEW_HEIGHT / 2),
        },
        {
            left: CANVAS_WIDTH - PREVIEW_WIDTH - 53,
            top: Math.floor(CANVAS_HEIGHT / 2 - PREVIEW_HEIGHT / 2),
        },
    ],
    "3": [
        {
            left: 53,
            top: 30,
        },
        {
            left: Math.floor(CANVAS_WIDTH - PREVIEW_WIDTH - 53),
            top: 30,
        },
        {
            left: Math.floor(CANVAS_WIDTH / 2 - PREVIEW_WIDTH / 2),
            top: Math.floor(CANVAS_HEIGHT - PREVIEW_HEIGHT - 30),
        },

    ],
    "4": [
        {
            left: 53,
            top: 30,
        },
        {
            left: Math.floor(CANVAS_WIDTH - PREVIEW_WIDTH - 53),
            top: 30,
        },
        {
            left: 53,
            top: Math.floor(CANVAS_HEIGHT - PREVIEW_HEIGHT - 30),
        },
        {
            left: Math.floor(CANVAS_WIDTH - PREVIEW_WIDTH - 53),
            top: Math.floor(CANVAS_HEIGHT - PREVIEW_HEIGHT - 30),
        },
    ],
};

const MAX_IMAGE_COLLAGE_COUNT = Object.keys(IMAGE_POSITIONS).length;

@Entity()
export class PackPreviewsEntity extends PreviewsEntityInterface {

    @OneToOne(() => PackEntity, pack => pack.previews, {onDelete: "CASCADE"})
    @JoinColumn({name: "packId"})
    pack: PackEntity;

    @PrimaryColumn({update: false})
    packId: string;

    @Column()
    isCustom: boolean;

    @AfterLoad()
    setUrls() {
        this.image720Url = !!this.image720Hash ? CDNMapper.packs.previews(this.packId,
            PackPreviewsEntity.IMAGE_720_FILENAME,
            this.image720Hash) : null;
        this.image360Url = !!this.image360Hash ? CDNMapper.packs.previews(this.packId,
            PackPreviewsEntity.IMAGE_360_FILENAME,
            this.image360Hash) : null;
        this.image240Url = !!this.image240Hash ? CDNMapper.packs.previews(this.packId,
            PackPreviewsEntity.IMAGE_240_FILENAME,
            this.image240Hash) : null;
        this.image180Url = !!this.image180Hash ? CDNMapper.packs.previews(this.packId,
            PackPreviewsEntity.IMAGE_180_FILENAME,
            this.image180Hash) : null;
    }

    async generateCollage(themes: ThemeEntity[], hbThemes: HBThemeEntity[]) {
        const orderedThemes = []
            .concat(themes.sort((a, b) => compareTargetFn(a.target, b.target)))
            .concat(hbThemes)
            .filter((theme: ThemeEntity | HBThemeEntity) => !theme.isPrivate);

        const firstBackground = orderedThemes.find((theme: ThemeEntity | HBThemeEntity) => !!theme.assets?.backgroundImageFile)?.assets.backgroundImageFile;
        const themePreviews = orderedThemes.map((theme: ThemeEntity | HBThemeEntity) => theme.previews.image720File);
        await this.generateFromThemes(firstBackground, themePreviews);
    }

    private async generateFromThemes(background: Buffer | null, images: Buffer[]) {
        const toCompose = [];

        const imageCount = Math.min(images.length, MAX_IMAGE_COLLAGE_COUNT);
        for (let imageNumber = 0; imageNumber < images.length && imageNumber <= MAX_IMAGE_COLLAGE_COUNT; imageNumber++) {
            toCompose.push({
                input: await PackPreviewsEntity.createRasterImage(images[imageNumber]),
                ...IMAGE_POSITIONS[imageCount][imageNumber],
            });
        }

        const collage = await sharp(background || backgroundGradient)
            .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
            .modulate({
                brightness: 0.8,
            })
            .blur(CANVAS_BLUR)
            .composite(toCompose)
            .toFormat("webp")
            .toBuffer();

        await super.generateFromStream(collage);
    }

    private static createRasterImage = (imagePath) => {
        return sharp(imagePath)
            .composite([
                {
                    input: roundedCorners,
                    blend: "dest-in",
                },
            ])
            .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT)
            .toBuffer();
    };

}