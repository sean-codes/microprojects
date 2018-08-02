var map = {
	scale: { x: 20, y: 20 },
	visual: [
		'             P      ',
		'             C      ',
		'                    ',
		'                    ',
		'                    ',
		'             C      ',
		'     C              ',
		'             _   -  ',
		'                  E ',
		'                  E ',
		'BC B         C    E ',
		'B  B              E ',
		'BC   C       B    BB',
		'B            BB  BBB',
		'BBBBBBBBBBBBBBBBBBBB',
	],
	link: {
		'B': { type: 'block', size: { x: 20, y: 20 } },
		'C': { type: 'crate', size: { x: 40, y: 40 } },
		'P': { type: 'player', size: { x: 20, y: 30 } },
		'_': { type: 'platform', size: { x: 60, y: 15 }, speed: { x: 0, y: 1 } },
		'-': { type: 'crate', size: { x: 60, y: 15 }, speed: { x: 0, y: 1 } },
		'E': { type: 'ladder', size: { x: 20, y: 20 }, speed: { x: 0, y: 0 } }
	}
}
