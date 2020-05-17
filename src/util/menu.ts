export default (menu) => {
	switch (menu) {
		case 'homemenu':
			return 'ResidentMenu'
		case 'lockscreen':
			return 'Entrance'
		case 'allapps':
			return 'Flaunch'
		case 'playerselect':
			return 'Psl'
	}
}
