export const webNameToFileNameNoExtension = (s) => {
	switch (s) {
		case 'homemenu':
			return 'ResidentMenu'
		case 'lockscreen':
			return 'Entrance'
		case 'userpage':
			return 'MyPage'
		case 'allapps':
			return 'Flaunch'
		case 'settings':
			return 'Set'
		case 'news':
			return 'Notification'
		case 'playerselect':
			return 'Psl'

		default:
			return null
	}
}

export const fileNameToThemeTarget = (s) => {
	switch (s) {
		case 'ResidentMenu.szs':
		case 'ResidentMenu':
			return 'home'
		case 'Entrance.szs':
		case 'Entrance':
			return 'lock'
		case 'MyPage.szs':
		case 'MyPage':
			return 'user'
		case 'Flaunch.szs':
		case 'Flaunch':
			return 'apps'
		case 'Set.szs':
		case 'Set':
			return 'set'
		case 'Notification.szs':
		case 'Notification':
			return 'news'
		case 'Psl.szs':
		case 'Psl':
			return 'psl'

		default:
			return null
	}
}
