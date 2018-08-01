var map = {
	scale: { x: 20, y: 20 },
	visual: [
		'                    ',
		'                    ',
		'              C     ',
		'                    ',
		'                    ',
		'             C      ',
		'                    ',
		'             _      ',
		'                    ',
		'     C              ',
		'                    ',
		'                    ',
		'        P    C    BB',
		'B               BBBB',
		'BBBBBBBBBBBBBBBBBBBB',
	],
	link: {
		B: { type: 'block', size: { x: 20, y: 20 } },
		C: { type: 'crate', size: { x: 40, y: 40 } },
		P: { type: 'player', size: { x: 20, y: 30 } },
		_: { type: 'platform', size: { x: 70, y: 15 }, speed: { x: 0, y: 1 } }
	}
}
