import { pgp } from '../db/db'
const {
	as: { format }
} = pgp

export default {
	Query: {
		fields: {
			me: {
				where: (table, _args, context) => format(`${table}.id = $1`, [context.req.user.id])
			},
			creator: {
				where: (table, { id }) => format(`(${table}.id = $1) OR ($1 = ANY(${table}.old_ids))`, [id])
			},
			layout: {
				where: (table, { id }) => format(`${table}.id = hex_to_int('$1^')`, [id])
			},
			layoutList: {
				orderBy: ({ order = 'desc' }) => {
					return { id: order }
				},
				where: (table, { target, creators }) => {
					const wheres = []

					if (target) {
						wheres.push(format(`${table}.target = $1`, [target]))
					}

					if (creators?.length > 0) {
						wheres.push(format(`${table}.creator_id = ANY($1)`, [creators]))
					}

					return wheres.join(' AND ')
				}
			},
			theme: {
				where: (table, { id }) => format(`${table}.id = hex_to_int('$1^')`, [id])
			},
			themeList: {
				orderBy: ({ order = 'desc' }) => {
					return { id: order }
				},
				where: (table, { target, creators }) => {
					const wheres = []

					if (target) {
						wheres.push(format(`${table}.target = $1`, [target]))
					}

					if (creators?.length > 0) {
						wheres.push(format(`${table}.creator_id = ANY($1)`, [creators]))
					}

					return wheres.join(' AND ')
				}
			},
			pack: {
				where: (table, { id }) => format(`${table}.id = hex_to_int('$1^')`, [id])
			},
			packList: {
				orderBy: ({ order = 'desc' }) => {
					return { id: order }
				},
				where: (table, { creators }) => {
					const wheres = []

					if (creators?.length > 0) {
						wheres.push(format(`${table}.creator_id = ANY($1)`, [creators]))
					}

					return wheres.join(' AND ')
				}
			}
		}
	},
	PrivateInfo: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			display_name: {
				sqlExpr: (table) =>
					`CASE WHEN ${table}.custom_username IS NOT NULL THEN ${table}.custom_username ELSE ${table}.discord_user ->> 'username' END`
			},
			custom_username: { sqlColumn: 'custom_username' },
			discord_user: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			bio: { sqlColumn: 'bio' },
			joined: { sqlColumn: 'joined' },
			roles: { sqlColumn: 'roles' },
			banner_image: { sqlColumn: 'banner_image' },
			logo_image: { sqlColumn: 'logo_image' },
			profile_color: { sqlColumn: 'profile_color' },
			liked: {
				sqlJoin: (table, creatorsTable) => `${table}.id = ${creatorsTable}.id`
			},
			like_count: {
				sqlExpr: (table) => `(
                    SELECT COUNT(*)
					FROM creators
					WHERE ${table}.id = ANY(liked_creators)
                )`
			},
			old_ids: { sqlColumn: 'old_ids' }
		}
	},
	UserInfo: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			display_name: {
				sqlExpr: (table) =>
					`CASE WHEN ${table}.custom_username IS NOT NULL THEN ${table}.custom_username ELSE ${table}.discord_user ->> 'username' END`
			},
			custom_username: { sqlColumn: 'custom_username' },
			discord_user: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			bio: { sqlColumn: 'bio' },
			joined: { sqlColumn: 'joined' },
			roles: { sqlColumn: 'roles' },
			banner_image: { sqlColumn: 'banner_image' },
			logo_image: { sqlColumn: 'logo_image' },
			profile_color: { sqlColumn: 'profile_color' },
			like_count: {
				sqlExpr: (table) => `(
                    SELECT COUNT(*)
					FROM creators
					WHERE ${table}.id = ANY(liked_creators)
                )`
			},
			old_ids: { sqlColumn: 'old_ids' }
		}
	},
	DiscordUser: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			username: {
				sqlExpr: (table) =>
					`CASE WHEN ${table}.custom_username IS NULL THEN ${table}.discord_user ->> 'username' END`
			},
			discriminator: {
				sqlExpr: (table) => `${table}.discord_user ->> 'discriminator'`
			},
			avatar: {
				sqlExpr: (table) => `${table}.discord_user ->> 'avatar'`
			}
			// system: {
			// 	sqlExpr: (table) => `${table}.discord_user ->> 'system'`
			// },
			// locale: {
			// 	sqlExpr: (table) => `${table}.discord_user ->> 'locale'`
			// }
		}
	},
	MyLikes: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			creators: {
				sqlJoin: (table, creatorsTable) => `${creatorsTable}.id = ANY(${table}.liked_creators)`
			},
			layouts: {
				sqlJoin: (table, creatorsTable) => `${creatorsTable}.id = ANY(${table}.liked_layouts)`
			},
			themes: {
				sqlJoin: (table, creatorsTable) => `${creatorsTable}.id = ANY(${table}.liked_themes)`
			},
			packs: {
				sqlJoin: (table, creatorsTable) => `${creatorsTable}.id = ANY(${table}.liked_packs)`
			}
		}
	},
	LayoutDetails: {
		sqlTable: 'layouts',
		uniqueKey: 'id',
		fields: {
			name: {
				sqlExpr: (table) => `${table}.details ->> 'name'`
			},
			description: {
				sqlExpr: (table) => `${table}.details ->> 'description'`
			},
			color: {
				sqlExpr: (table) => `${table}.details ->> 'color'`
			},
			version: {
				sqlExpr: (table) => `${table}.details ->> 'version'`
			}
		}
	},
	ThemeDetails: {
		sqlTable: 'themes',
		uniqueKey: 'id',
		fields: {
			name: {
				sqlExpr: (table) => `${table}.details ->> 'name'`
			},
			description: {
				sqlExpr: (table) => `${table}.details ->> 'description'`
			},
			version: {
				sqlExpr: (table) => `${table}.details ->> 'version'`
			}
		}
	},
	PackDetails: {
		sqlTable: 'packs',
		uniqueKey: 'id',
		fields: {
			name: {
				sqlExpr: (table) => `${table}.details ->> 'name'`
			},
			description: {
				sqlExpr: (table) => `${table}.details ->> 'description'`
			},
			version: {
				sqlExpr: (table) => `${table}.details ->> 'version'`
			}
		}
	},
	Layout: {
		sqlTable: 'layouts',
		uniqueKey: 'id',
		fields: {
			uuid: { sqlColumn: 'uuid' },
			id: {
				sqlExpr: (table) => `to_hex(${table}.id)`
			},
			creator: {
				sqlJoin: (table, creatorsTable) =>
					`(${table}.creator_id = ${creatorsTable}.id) OR (${table}.creator_id = ANY(${creatorsTable}.old_ids))`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			baselayout: { sqlColumn: 'baselayout' },
			target: { sqlColumn: 'target' },
			last_updated: { sqlColumn: 'last_updated' },
			has_pieces: {
				sqlExpr: (table) => `CASE WHEN (cardinality(${table}.pieces) > 0) THEN true ELSE false END`
			},
			pieces: {
				sqlColumn: 'pieces',
				jmIgnoreTable: true
			},
			has_commonlayout: {
				sqlExpr: (table) => `CASE WHEN ${table}.commonlayout IS NULL THEN false ELSE true END`
			},
			commonlayout: { sqlColumn: 'commonlayout' },
			dl_count: { sqlColumn: 'dl_count' },
			like_count: {
				sqlExpr: (table) => `(
                    SELECT COUNT(*)
					FROM creators
					WHERE ${table}.id = ANY(liked_layouts)
                )`
			}
		}
	},
	PreviewTypes: {
		sqlTable: 'themes',
		uniqueKey: 'id',
		fields: {
			original: {
				sqlExpr: (table) =>
					`CONCAT('${process.env.API_ENDPOINT}/cdn/themes/', to_hex(${table}.id), '/images/original.jpg')`
			},
			thumb: {
				sqlExpr: (table) =>
					`CONCAT('${process.env.API_ENDPOINT}/cdn/themes/', to_hex(${table}.id), '/images/thumb.jpg')`
			}
		}
	},
	Theme: {
		sqlTable: 'themes',
		uniqueKey: 'id',
		fields: {
			id: {
				sqlExpr: (table) => `to_hex(${table}.id)`
			},
			creator: {
				sqlJoin: (table, creatorsTable) => `${table}.creator_id = ${creatorsTable}.id`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			layout: {
				sqlJoin: (table, layoutsTable) => `${table}.layout_id = ${layoutsTable}.id`
			},
			pack: {
				sqlJoin: (table, packsTable) => `${table}.pack_id = ${packsTable}.id`
			},
			target: { sqlColumn: 'target' },
			last_updated: { sqlColumn: 'last_updated' },
			pieces: {
				jmIgnoreTable: true,
				sqlExpr: (table) => `(
                    SELECT array_agg(row_to_json(pcs)) AS pieces
                    FROM (
                        SELECT unnest(pieces) ->> 'name' as name, json_array_elements(unnest(pieces)->'values') as value
                        FROM layouts
                        WHERE id = ${table}.layout_id
                    ) as pcs
                    WHERE value ->> 'uuid' = ANY(${table}.piece_uuids::text[])
                )`
			},
			categories: { sqlColumn: 'categories' },
			dl_count: { sqlColumn: 'dl_count' },
			like_count: {
				sqlExpr: (table) => `(
                    SELECT COUNT(*)
					FROM creators
					WHERE ${table}.id = ANY(liked_themes)
                )`
			},
			bg_type: { sqlColumn: 'bg_type' },
			preview: {
				sqlJoin: (table, previewTable) => `${table}.id = ${previewTable}.id`
			}
		}
	},
	Pack: {
		sqlTable: 'packs',
		uniqueKey: 'id',
		fields: {
			id: {
				sqlExpr: (table) => `to_hex(${table}.id)`
			},
			creator: {
				sqlJoin: (table, creatorsTable) => `${table}.creator_id = ${creatorsTable}.id`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			last_updated: { sqlColumn: 'last_updated' },
			categories: {
				sqlExpr: (table) => `(
                    SELECT array_agg(c) as categories
                    FROM (
                        SELECT DISTINCT UNNEST(categories)
                        FROM themes
						WHERE pack_id = ${table}.id
						ORDER BY "unnest" ASC
                    ) as t(c)
                )
                `
			},
			dl_count: { sqlColumn: 'dl_count' },
			like_count: {
				sqlExpr: (table) => `(
                    SELECT COUNT(*)
					FROM creators
					WHERE ${table}.id = ANY(liked_packs)
                )`
			},
			themes: {
				// Joinmonster doesn't support a simple custom orderby function. This seems to be the only option for now
				orderBy: `id" = 1, "themes".details ->> 'name' COLLATE "en-US-x-icu", order_by_array(Array['ResidentMenu', 'Entrance', 'Flaunch', 'Set', 'Psl', 'MyPage', 'Notification'], "themes".target) --`,
				sqlJoin: (table, themesTable) => `${table}.id = ${themesTable}.pack_id`
			}
		}
	}
}
