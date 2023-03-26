let glg = document.querySelector("#gamelog");
let ac = document.querySelector(`#actions`);
let Mm = document.querySelector(`#map`)
let mapThings = ['nothing']
let inventoryMod = false
let score = 0
let run = false
let acs = []
astIMGs = [`slime`,`wolf`,`bear`]
let enemies = {
    slime: {
        hp: Math.floor(Math.random() * 20 + 5),
        dmg: 0,
		speed: -2,
        drop: [
			{chance:50,item:{name:'Съедобная слизь',type: `food`,Saturation:30,weight:1,durability:1}},
			{chance:33,item:{name:'Съедобная слизь',type: `food`,Saturation:30,weight:1,durability:1}},
			{chance:22,item:{name:'Зелье',type: `Health Recovery Potion`, Efficiency:0.5,weight:0.5,durability:1}},
			{chance:10,item:{name:'Cкользкая палка',type: `melee weapon`,dmg:4,weight:4,durability:20}},
		]
    },
    wolf: {
        hp: Math.floor(Math.random() * 15 + 10),
        dmg: 2,
		speed: 5,
        drop: [
			{chance:66,item:{name:'Мясо волка',type: `food`,Saturation:90,weight:2,durability:2}},
			{chance:66,item:{name:'Клык волка',type: `one-handed melee weapon`,dmg:3,weight:2,durability:70}},
		]
    },
    bear: {
        hp: Math.floor(Math.random() * 15 + 30),
        dmg: 4,
		speed: 1,
        drop: [
			{chance:66,item:{name:'Мясо медведя',type: `food`,Saturation:90,weight:2,durability:3}},
			{chance:66,item:{name:'Мясо медведя',type: `food`,Saturation:90,weight:2,durability:3}},
			{chance:66,item:{name:'Мясо медведя',type: `food`,Saturation:90,weight:2,durability:3}},
			{chance:66,item:{name:'Клык медведя',type: `one-handed melee weapon`,dmg:4,weight:2,durability:150}},
		]
    },
}

class mapThing {
	constructor() {
		this.name = mapThings[Math.floor(Math.random() * mapThings.length)]
		this.type = 'mapThing'
		if (this.name in enemies) {
			this.type = `enemy`
			this.hp = enemies[this.name].hp
			this.dmg = enemies[this.name].dmg
			this.drop = enemies[this.name].drop
			this.speed = enemies[this.name].speed
		}
	}
};

let air = new mapThing();
let mapThingss = [{thing:'nothing', ratio:222},{thing:`wall`, ratio:300},{thing:`slime`, ratio:77},{thing:`wolf`, ratio:33},{thing:`bear`, ratio:1},]
for (let i = 0; i < mapThingss.length; i++) {
	for (let j = 0; j < mapThingss[i].ratio; j++) {
		mapThings.push(mapThingss[i].thing)
	}
}
mapThings.sort(() => Math.random() - 0.5);

let map = {
	'-1': {
		'-1': air,
		'1': air,
		'0': air
	},
	'0': {
		'-1': air,
		'1': air,
		'0': air
	},
	'1': {
		'-1': air,
		'1': air,
		'0': air
	},
}
let x = 0
let y = 0
let plr = {
	maxHP: 20,
	HP: 20,
	maxSatiety: 300,
	Satiety: 150,
    dmg: 2,
    speed: 5,
	strength: 1,
	inventory: [],
	hands: [],
};

function game() {
	mapGen()
	renderMap()
	acs = []
	if (plr.HP > 0) {
		breakingCheck()
		score++
		if (plr.Satiety > 0) {
			plr.Satiety--
            if(plr.Satiety<plr.maxSatiety/2){
                adglg(`Ты чувствуешь голод`)
            }
		} else {
			plr.HP--
            adglg(`Ты умираешь от истощения`)
		}
		if (plr.HP>plr.maxHP){
			plr.maxHP += Math.floor(Math.random() * (plr.HP-plr.maxHP)/10)
			plr.HP=plr.maxHP
			adglg('Ты чувствуешь себя здоровее')
		} else if (plr.HP<plr.maxHP){
			if (plr.HP<plr.maxHP*0.25) {
				if (plr.HP<10){
					adglg('Ты присмерти')
					if (map[x][y].type != `enemy` && plr.Satiety > 0){
						plr.Satiety-=10
						plr.HP++
						plr.maxHP++
					}
				} else {
					adglg('Ты очень сильно ранен')}
			} else if (plr.HP<plr.maxHP*0.5) {
				adglg('Ты сильно ранен')
			} else if (plr.HP<plr.maxHP*0.75) {
				adglg('Ты ранен')
			}
			if (plr.Satiety>plr.maxSatiety*0.80) {
				plr.HP++
				plr.Satiety--
				adglg('Раны затягиваються')
			}
		}
		if (inventoryMod){
			acs.push({name:'Закрыть инвентарь',do(){
				inventoryMod = false
			}})
			for (let i = 0; i < plr.inventory.length; i++) {
				acs.push({name: plr.inventory[i].name,do(){
					plr.hands.push(plr.inventory[i])
					plr.inventory.splice(i, 1)
					inventoryMod = false
				}})
			}
		} else {
			if (map[x][y].type == `enemy`) {
				if(run){
					run = false
					go()
				} else {
					plr.HP -= Math.ceil((Math.random() * map[x][y].dmg + map[x][y].dmg)/2)
					adglg(`<p>Враг - ${map[x][y].name} атакует тебя!</p>`)
					if (plr.HP<5){
						plr.maxHP ++
						adglg('Ты становишся выносливее')
					}
					acs.push({name:`Атаковать - ${map[x][y].name}`,do(){
						let energyСosts = 1
						for (item=0;item<plr.inventory.length;item++) {
							energyСosts+=plr.inventory[item].weight
						};
						let dmgBust = 0
						for (i=0; i<plr.hands.length;i++){
							if (plr.hands[i].type == 'one-handed melee weapon' && plr.hands.length<3){
								dmgBust += plr.hands[i].dmg
								plr.hands[i].durability--
								energyСosts+=plr.hands[i].weight*0.5
							} else if (plr.hands[i].type == 'melee weapon' && plr.hands.length == 1){
								dmgBust += plr.hands[i].dmg
								plr.hands[i].durability--
								energyСosts+=plr.hands[i].weight*0.5
							} else {
								for (item=0;item<plr.hands.length;item++) {
									energyСosts+=plr.hands[item].weight*2
								};
							}
						}
						plr.Satiety-=energyСosts
						a = Math.floor(Math.random() * (plr.dmg + dmgBust)) + plr.dmg
						map[x][y].hp -= a
						score += a
						adglg(`Ты атакуешь врага - ${map[x][y].name}`)
						if (map[x][y].hp <= 0){
							if (map[x][y].dmg>plr.dmg && plr.hands.length==0){
								plr.dmg++
								adglg('Ты становишся сильнее')
							}
							map[x][y] = {name:`items`, type:`items`, items: ldrop(map[x][y])}
							if (map[x][y].items.length == 0){
								map[x][y] = air
							}
							adglg(`Ты убиваешь врага`)
						}
					}},)
					acs.push({name:'Убежать от врага',do(){
						a = Math.floor(Math.random() * map[x][y].hp) + plr.speed
						if (a > map[x][y].speed + (map[x][y].hp/2)){
							plr.Satiety -= a
							run = true
							adglg('Ты убегаешь от врага')
						} else {
							adglg('Враг не даёт убежать')
						}
					}},)
				}
			} else if(map[x][y].type == `items`) {
				adglg(`Тут лежат:`)
				for (let i = 0; i < map[x][y].items.length; i++) {
					adglg(`${map[x][y].items[i].name}`)
					acs.push({name:`поднять - ${map[x][y].items[i].name}`,do(){
						plr.hands.push(map[x][y].items[i])
						map[x][y].items.splice(i, 1)
						if (map[x][y].items.length==0) {
							map[x][y] = air
						}
					}})
				}
				go()
				acs.push({name:'Открыть инвентарь',do(){
					inventoryMod = true
				}})
				usage()
			} else {
				go()
				acs.push({name:'Открыть инвентарь',do(){
					inventoryMod = true
				}})
				usage()
			}
		}
	} else {
		adglg(`Ты умер, счёт - ${score}`)
		acs = [{name:'Заново',do(){location.reload()}}]
	}
	renderACs()
	window.scrollTo(0, document.documentElement.offsetHeight)
};

function breakingCheck(){
	perr = []
	for (let i = 0; i < plr.hands.length; i++) {
		if (plr.hands[i].durability>0) {
			perr.push(plr.hands[i])
		}
	}
	plr.hands = perr
	perr = []
	for (let i = 0; i < plr.inventory.length; i++) {
		if (plr.inventory[i].durability>0) {
			perr.push(plr.inventory[i])
		}
	}
	plr.inventory = perr
};

function usage() {
	for (let i = 0; i < plr.hands.length; i++) {
		acs.push({name:`Положить в инвентарь - ${plr.hands[i].name}`,do(){
			plr.inventory.push(plr.hands[i])
			plr.hands.splice(i, 1)
		}})
		acs.push({name:`Выбросить - ${plr.hands[i].name}`,do(){
			if (map[x][y].type != 'items'){
				if (map[x][y].name == 'nothing'){
					map[x][y] = {name:`items`, type:`items`, items: [plr.hands[i]]}
					plr.hands.splice(i, 1)
				}
			} else {
				map[x][y].items.push(plr.hands[i])
				plr.hands.splice(i, 1)
			}
		}})
		if (plr.hands[i].type == 'food') {
			acs.push({name:`Съесть - ${plr.hands[i].name}`,do(){
				adglg(`Ты съедаешь - ${plr.hands[i].name}`)
				plr.Satiety += plr.hands[i].Saturation
				plr.hands[i].durability--
				if (plr.Satiety>plr.maxSatiety) {
					plr.HP+= Math.floor((plr.Satiety-plr.maxSatiety)/10)
					plr.maxSatiety += Math.floor((plr.Satiety-plr.maxSatiety)/10)
					adglg('Ты чувствуешь себя выносливее')
					plr.Satiety = plr.maxSatiety
				}
			}})
		} else if (plr.hands[i].type == 'Health Recovery Potion'){
			acs.push({name:`Выпить - ${plr.hands[i].name}`,do(){
				adglg(`Ты используешь - ${plr.hands[i].name}`)
				if (plr.HP>plr.maxHP/2) {
					plr.HP += (plr.maxHP - plr.HP)*plr.hands[i].Efficiency
				} else{
					plr.HP+= plr.HP*plr.hands[i].Efficiency
				}
				plr.Satiety -= plr.HP
				plr.hands[i].durability--
			}})
		}
	}
}

function go(){
	let energyСosts = 0
	for (item=0;item<plr.inventory.length;item++) {
		energyСosts+=plr.inventory[item].weight
	};
	for (item=0;item<plr.hands.length;item++) {
		energyСosts+=(plr.hands[item].weight*2)
	};
	if (energyСosts>plr.strength){
		energyСosts -= plr.strength
		plr.strength += energyСosts/100
	} else {
		energyСosts = 0
	}
    if (map[x][y + 1].name != `wall`) {
        acs.push({name:'↑',do(){y++; plr.Satiety-=energyСosts}})
    }
    if (map[x][y - 1].name != `wall`) {
        acs.push({name:'↓',do(){y--; plr.Satiety-=energyСosts}})
    }
    if (map[x - 1][y].name != `wall`) {
        acs.push({name:'←',do(){x--; plr.Satiety-=energyСosts}})
    }
    if (map[x + 1][y].name != `wall`) {
        acs.push({name:'→',do(){x++; plr.Satiety-=energyСosts}})
    }
}

function ldrop(a){
	b = []
	for (let i = 0; i < a.drop.length; i++) {
		if (Math.floor(Math.random() * 100 + 1)<a.drop[i].chance){
			b.push(JSON.parse(JSON.stringify(a.drop[i].item)))
		}
	}
	return b
}

function adglg(a){
    glg.innerHTML += `<p>${a}</p>`
}

function renderACs() {
	ac.innerHTML = ``
	for (let i = 0; i < acs.length; i++) {
		if (acs[i].name == `↑`){
			ac.innerHTML += `<div class="Button up">${acs[i].name}</div>`;
		} else if (acs[i].name == `↓`){
			ac.innerHTML += `<div class="Button down">${acs[i].name}</div>`;
		} else if (acs[i].name == `←`){
			ac.innerHTML += `<div class="Button left">${acs[i].name}</div>`;
		} else if (acs[i].name == `→`){
			ac.innerHTML += `<div class="Button right">${acs[i].name}</div>`;
		} else {
			ac.innerHTML += `<div class="Button">${acs[i].name}</div>`;
		}
	}
	let a = document.querySelectorAll(`.Button`)
	for (let i = 0; i < a.length; i++) {
		a[i].addEventListener('click', () => {
			glg.innerHTML = ''
			acs[i].do()
			game()
		})
	}
};

function renderMap() {
	let rend = {}
	function add(x,y) {
		if (!(x in rend)){
			rend[x] = {}
		}
		if (!(y in rend[x])){
			rend[x][y] = {}
		}
	}
	function check(x,y) {
		if(x in rend){
			if (y in rend[x]){
				return true
			} else {
				return false
			}
		} else {
			return false
		}
	}
	mt = ``
	for (let yi = 1; yi > -2; yi--) {
		for (let xi = -1; xi < 2; xi++) {
			add(x+xi,y+yi)
		};
	};
	for (let xi = -2; xi < 3; xi++) {
		if (map[x+Math.sign(xi)][y+1].name == 'nothing'){
			add(x+xi,y+2)
		}
	};
	for (let xi = -2; xi < 3; xi++) {
		if (map[x+Math.sign(xi)][y-1].name == 'nothing'){
			add(x+xi,y-2)
		}
	};
	for (let yi = -2; yi < 3; yi++) {
		if (map[x+1][y+Math.sign(yi)].name == 'nothing'){
			add(x+2,y+yi)
		}
	};
	for (let yi = -2; yi < 3; yi++) {
		if (map[x-1][y+Math.sign(yi)].name == 'nothing'){
			add(x-2,y+yi)
		}
	};
	for (let yi = 2; yi > -3; yi--) {
		for (let xi = -2; xi < 3; xi++) {
			if (xi==0&&yi==0) {
				mt += `<div class="cell player"></div>`
			} else {
				if (check(x+xi,y+yi)) {
					if (map[x+xi][y+yi].type=='items'){
						perr=``
						for (let i = 0; i < map[x+xi][y+yi].items.length; i++) {
							perr += `<p style="margin-bottom: 0px;">${map[x+xi][y+yi].items[i].name}</p>`
						}
						mt += `<div class="cell ${map[x+xi][y+yi].name}">${perr}</div>`
					} else {
						if (astIMGs.includes(map[x+xi][y+yi].name)){
							mt += `<img src="assets/${map[x+xi][y+yi].name}.jpg" class="cell ${map[x+xi][y+yi].name}">`
						} else {
							mt += `<div class="cell ${map[x+xi][y+yi].name}"></div>`
						}
					}
				} else {
					mt += `<div class="cell dark}"></div>`
				}
			}
		};
	};
	Mm.innerHTML = mt
};

function mapGen() {
	for (let xi = -2; xi < 3; xi++) {
		if (x + xi in map) {
			for (let yi = -2; yi < 3; yi++) {
				if (!(y + yi in map[x + xi])) {
					map[x + xi][y + yi] = new mapThing
				}
			}
		} else {
			map[x + xi] = {}
			for (let yi = -2; yi < 3; yi++) {
				map[x + xi][y + yi] = new mapThing
			}
		}
	}
};
game()