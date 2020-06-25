import { pgp } from '../db/db'
const {
	as: { format }
} = pgp

export default {
	Query: {
		fields: {
			creator: {
				where: (table, { id }) => format(`${table}.id = $1`, [id])
			},
			layout: {
				where: (table, { id, target }) => format(`${table}.id = $1 AND ${table}.target = $2`, [id, target])
			},
			layoutsList: {
				orderBy: {
					last_updated: 'DESC'
				},
				limit: ({ limit }) => limit,
				where: (table, { target, creator_id }) => {
					const wheres = []

					if (target) {
						wheres.push(format(`${table}.target = $1`, [target]))
					}

					if (creator_id) {
						wheres.push(format(`${table}.creator_id = $1`, [creator_id]))
					}

					return wheres.join(' AND ')
				}
			},
			theme: {
				where: (table, { id, target }) => format(`${table}.id = $1 AND ${table}.target = $2`, [id, target])
			},
			themesList: {
				orderBy: {
					last_updated: 'DESC'
				},
				limit: ({ limit }) => limit,
				where: (table, { target, creator_id }) => {
					const wheres = []

					if (target) {
						wheres.push(format(`${table}.target = $1`, [target]))
					}

					if (creator_id) {
						wheres.push(format(`${table}.creator_id = $1`, [creator_id]))
					}

					return wheres.join(' AND ')
				}
			},
			pack: {
				where: (table, { id }) => format(`${table}.id = $1`, [id])
			},
			packsList: {
				orderBy: {
					last_updated: 'DESC'
				},
				limit: ({ limit }) => limit,
				where: (table, { creator_id }) => {
					const wheres = []

					if (creator_id) {
						wheres.push(format(`${table}.creator_id = $1`, [creator_id]))
					}

					return wheres.join(' AND ')
				}
			}
		}
	},
	UserInfo: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			discord_user: {
				sqlJoin: (table, detailsTable) => `${table}.id = ${detailsTable}.id`
			},
			bio: { sqlColumn: 'bio' },
			joined: { sqlColumn: 'joined' },
			role: { sqlColumn: 'role' },
			banner_image: { sqlColumn: 'banner_image' },
			logo_image: { sqlColumn: 'logo_image' },
			profile_color: { sqlColumn: 'profile_color' }
		}
	},
	DiscordUser: {
		sqlTable: 'creators',
		uniqueKey: 'id',
		fields: {
			username: {
				sqlExpr: (table) => `${table}.discord_user ->> 'username'`
			},
			discriminator: {
				sqlExpr: (table) => `${table}.discord_user ->> 'discriminator'`
			},
			avatar: {
				sqlExpr: (table) => `${table}.discord_user ->> 'avatar'`
			},
			system: {
				sqlExpr: (table) => `${table}.discord_user ->> 'system'`
			},
			locale: {
				sqlExpr: (table) => `${table}.discord_user ->> 'locale'`
			}
		}
	},
	LayoutDetails: {
		sqlTable: 'layouts',
		uniqueKey: 'uuid',
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
		uniqueKey: 'uuid',
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
		uniqueKey: 'uuid',
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
		uniqueKey: 'uuid',
		fields: {
			id: { sqlColumn: 'id' },
			creator: {
				sqlJoin: (table, creatorTable) =>
					`(${table}.creator_id = ${creatorTable}.id) OR (${table}.creator_id = ANY(${creatorTable}.old_ids))`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.uuid = ${detailsTable}.uuid`
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
			dl_count: { sqlColumn: 'dl_count' }
		}
	},
	Theme: {
		sqlTable: 'themes',
		uniqueKey: 'uuid',
		fields: {
			id: { sqlColumn: 'id' },
			creator: {
				sqlJoin: (table, creatorTable) => `${table}.creator_id = ${creatorTable}.id`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.uuid = ${detailsTable}.uuid`
			},
			layout: {
				sqlJoin: (table, layoutsTable) => `${table}.layout_uuid = ${layoutsTable}.uuid`
			},
			pack: {
				sqlJoin: (table, packsTable) => `${table}.pack_uuid = ${packsTable}.uuid`
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
                        WHERE uuid = ${table}.layout_uuid
                    ) as pcs
                    WHERE value ->> 'uuid' = ANY(${table}.piece_uuids::text[])
                )`
			},
			categories: { sqlColumn: 'categories' },
			dl_count: { sqlColumn: 'dl_count' },
			bg_type: { sqlColumn: 'bg_type' }
		}
	},
	Pack: {
		sqlTable: 'packs',
		uniqueKey: 'uuid',
		fields: {
			id: { sqlColumn: 'id' },
			creator: {
				sqlJoin: (table, creatorTable) => `${table}.creator_id = ${creatorTable}.id`
			},
			details: {
				sqlJoin: (table, detailsTable) => `${table}.uuid = ${detailsTable}.uuid`
			},
			last_updated: { sqlColumn: 'last_updated' },
			categories: {
				sqlExpr: (table) => `(
                    SELECT array_agg(c) as categories
                    FROM (
                        SELECT DISTINCT UNNEST(categories)
                        FROM themes
                        WHERE pack_uuid = ${table}.uuid
                    ) as t(c)
                )
                `
			},
			dl_count: { sqlColumn: 'dl_count' },
			themes: {
				sqlJoin: (table, themesTable) => `${table}.uuid = ${themesTable}.pack_uuid`
			}
		}
	}
}
