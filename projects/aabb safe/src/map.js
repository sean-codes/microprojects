var map = {
	scale: { x: 20, y: 20 },
	visual: [
		'                    ',
		'                    ',
		'  P                 ',
		'                    ',
		'                    ',
		'             c      ',
		' C   C       c      ',
		'                    ',
		'             _    E ',
		'                  E ',
		'B  B              E ',
		'B  B              E ',
		'BC       H   B    BB',
		'B            BB  BBB',
		'BBBBBBBBBBBBBBBBBBBB',
	],
	link: {
		'B': { type: 'block', size: { x: 20, y: 20 } },
		'C': { type: 'crate', size: { x: 40, y: 40 } },
		'c': { type: 'crate', size: { x: 40, y: 20 } },
		'P': { type: 'player', size: { x: 20, y: 30 } },
		'_': { type: 'platform', size: { x: 60, y: 15 }, speed: { x: 0, y: 1 } },
		'H': { type: 'platform', size: { x: 60, y: 15 }, speed: { x: 1, y: 0 } },
		'-': { type: 'ghostplatform', size: { x: 60, y: 15 }, speed: { x: 1, y: 0 } },
		'V': { type: 'ghostplatform', size: { x: 60, y: 15 }, speed: { x: 0, y: 0 }, wall: { cord: 'y', direction: 1 } },
		'E': { type: 'ladder', size: { x: 20, y: 20 }, speed: { x: 0, y: 0 } }
	}
}
