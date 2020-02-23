const SHIP_VALUE = 368;
const EARTH = '#';
let map;
let freeValueInShip;
let step = 1; //шаг погрузки товара
let prevStep = 0; //предыдущий ход в motion
let key = 'mainY'; //выбор движения в motion
let bestIDs; //id лучших порта и товара
let destinationCoord; //координаты направления


export function startGame(levelMap, gameState) {
    map = levelMap.split('\n')
    //console.log(map[0][18] == SEA);
    console.log('start', gameState);

    freeValueInShip = SHIP_VALUE; //свободное место на корабле (здесь для обнуления с новым уровнем)
}

export function getNextCommand(gameState) {
    if (gameState.ship.goods.length == 0 || step == 2) {
        if (gameState.ship.x == gameState.ports[0].x && gameState.ship.y == gameState.ports[0].y) {
            let goodsAmount; //количество товара на погрузку              
            prevStep = 0;
            //ЗАГРУЗКА
            switch (step) {
                case 1: //загрузка первого товара
                    bestIDs = Selection();
                    let bestGoods = gameState.goodsInPort[bestIDs.goodsId].name;
                    goodsAmount = amountCounting(bestIDs.goodsId);
                    destinationCoord = getCoordinates(bestIDs.portsId); //координаты порта
                    freeValueInShip = freeValueInShip - goodsAmount * gameState.goodsInPort[bestIDs.goodsId].volume;
                    console.log('загружаю', bestGoods, goodsAmount, 'и отправляю в порт:', bestIDs.portsId);
                    return 'LOAD ' + bestGoods + ' ' + goodsAmount;
                case 2: //загрузка второго товара
                    let bestSecondGoodsID = goodsSelection(bestIDs.portsId);
                    let bestSecondGoods = gameState.goodsInPort[bestSecondGoodsID].name;
                    goodsAmount = amountCounting(bestSecondGoodsID);
                    freeValueInShip = freeValueInShip - goodsAmount * gameState.goodsInPort[bestSecondGoodsID].volume;
                    console.log('догружаю', bestSecondGoods, goodsAmount, 'и отправляю в порт:', bestIDs.portsId);
                    return 'LOAD ' + bestSecondGoods + ' ' + goodsAmount;
            }

        } else {
            //ДОМОЙ...
            //console.log(motion2(gameState.ship.x, gameState.ship.y));
            return motion(gameState.ship.x, gameState.ship.y);
        }
    } else {
        if (gameState.ship.x == gameState.ports[bestIDs.portsId].x && gameState.ship.y == gameState.ports[bestIDs.portsId].y) {
            //ПРОДАЖА
            destinationCoord = getHomeCoordinates();
            freeValueInShip = SHIP_VALUE;
            prevStep = 0;
            console.log('продаю', gameState.ship.goods[0].name, gameState.ship.goods[0].amount);
            return 'SELL ' + gameState.ship.goods[0].name + ' ' + gameState.ship.goods[0].amount;
        } else {
            //В ПОРТ...
            //console.log(destinationCoord);
            return motion(gameState.ship.x, gameState.ship.y);
        }
    }

    function getCoordinates(id) {
        return { x: gameState.ports[id].x, y: gameState.ports[id].y };
    }

    function getHomeCoordinates() {
        return { x: gameState.ports[0].x, y: gameState.ports[0].y };
    }


    function motion(x, y) {
        switch (key) {
            case 'mainX':
                return mainX();
            case 'mainY':
                return mainY();
            case 'alt2X':
                return alt2X();
            case 'alt2Y':
                return alt2Y();
        }
        function mainX() {
            console.log('mainX');
            if (x > destinationCoord.x) {
                if (map[y][x - 1] != EARTH && prevStep != 'e') {
                    key = 'mainX';
                    prevStep = 'w';
                    return 'W';
                } else {
                    return altY();
                }
            } else if (x < destinationCoord.x) {
                if (map[y][x + 1] != EARTH && prevStep != 'w') {
                    key = 'mainX';
                    prevStep = 'e';
                    return 'E';
                } else {
                    return altY();
                } 
            } else {
                return mainY()
            }
        }
        function mainY() {
            console.log('mainY');
            if (y > destinationCoord.y) {
                if (map[y - 1][x] != EARTH && prevStep != 's') {
                    key = 'mainY';
                    prevStep = 'n';
                    return 'N';
                } else {
                    return altX();
                }
            } else if (y < destinationCoord.y) {
                if (map[y + 1][x] != EARTH && prevStep != 'n') {
                    key = 'mainY';
                    prevStep = 's';
                    return 'S';
                } else {
                    return altX();
                }
            } else {
                return mainX();
            }
        }
        function altX() {
            console.log('altX');
            if (x > destinationCoord.x) {
                if (map[y][x - 1] != EARTH && prevStep != 'e') {
                    key = 'mainX';
                    prevStep = 'w';
                    return 'W';
                } else {
                    return alt2X();
                }
            } else if (x < destinationCoord.x) {
                if (map[y][x + 1] != EARTH && prevStep != 'w') {
                    key = 'mainX';
                    prevStep = 'e';
                    return 'E';
                } else {
                    return alt2X();
                } 
            } else {
                return alt2X()
            }
        }
        function altY() {
            console.log('altY');
            if (y > destinationCoord.y) {
                if (map[y - 1][x] != EARTH && prevStep != 's') {
                    key = 'mainY';
                    prevStep = 'n';
                    return 'N';
                } else {
                    return alt2Y();
                }
            } else if (y < destinationCoord.y) {
                if (map[y + 1][x] != EARTH && prevStep != 'n') {
                    key = 'mainY';
                    prevStep = 's';
                    return 'S';
                } else {
                    return alt2Y();
                }
            } else {
                return alt2Y();
            }
        }
        function alt2X() {
            console.log('alt2X');
            if (y > destinationCoord.y) {
                if (map[y - 1][x + 1] != EARTH && map[y][x + 1] != EARTH) {
                    key = 'mainX';
                    prevStep = 'e';
                    return 'E';
                } else if (map[y - 1][x - 1] != EARTH && map[y][x - 1] != EARTH) {
                    key = 'mainX';
                    prevStep = 'w';
                    return 'W';
                } else if (map[y - 1][x + 2] != EARTH && map[y][x + 1] != EARTH) {
                    key = 'alt2X';
                    prevStep = 'e';
                    return 'E';
                } else if (map[y - 1][x - 2] != EARTH && map[y][x - 1] != EARTH) {
                    key = 'alt2X';
                    prevStep = 'w';
                    return 'W';
                } else {
                    return altY();
                }
            } else if (y < destinationCoord.y) {
                if (map[y + 1][x + 1] != EARTH && map[y][x + 1] != EARTH) {
                    key = 'mainX';
                    prevStep = 'e';
                    return 'E';
                } else if (map[y + 1][x - 1] != EARTH && map[y][x - 1] != EARTH) {
                    key = 'mainX';
                    prevStep = 'w';
                    return 'W';
                } else if (map[y + 1][x + 2] != EARTH && map[y][x + 1] != EARTH) {
                    key = 'alt2X';
                    prevStep = 'e';
                    return 'E';
                } else if (map[y + 1][x - 2] != EARTH && map[y][x - 1] != EARTH) {
                    key = 'alt2X';
                    prevStep = 'w';
                    return 'W';
                } else {
                    return altY();
                }
            } else {
                return altY();
            }
        }
        function alt2Y() {
            console.log('alt2Y');
            if (x > destinationCoord.x) {
                if (map[y - 1][x - 1] != EARTH && map[y - 1][x] != EARTH) {
                    key = 'mainY';
                    prevStep = 'n';
                    return 'N';
                } else if (map[y + 1][x - 1] != EARTH && map[y + 1][x] != EARTH) {
                    key = 'mainY';
                    prevStep = 's';
                    return 'S';
                } else if (map[y - 2][x - 1] != EARTH && map[y - 1][x] != EARTH) {
                    key = 'alt2Y';
                    prevStep = 'n';
                    return 'N';
                } else if (map[y + 2][x - 1] != EARTH && map[y + 1][x] != EARTH) {
                    key = 'alt2Y';
                    prevStep = 's';
                    return 'S';
                } else {
                    return altX();
                }
            } else if (x < destinationCoord.x) {
                if (map[y - 1][x + 1] != EARTH && map[y - 1][x] != EARTH) {
                    key = 'mainY';
                    prevStep = 'n';
                    return 'N';
                } else if (map[y + 1][x + 1] != EARTH && map[y + 1][x] != EARTH) {
                    key = 'mainY';
                    prevStep = 's';
                    return 'S';
                } else if (map[y - 2][x + 1] != EARTH && map[y - 1][x] != EARTH) {
                    key = 'alt2Y';
                    prevStep = 'n';
                    return 'N';
                } else if (map[y + 2][x + 1] != EARTH && map[y + 1][x] != EARTH) {
                    key = 'alt2Y';
                    prevStep = 's';
                    return 'S';
                } else {
                    return altX();
                }
            } else {
                return altX();
            }
        }
    }

    function Selection() {
        let goodsId = 0;
        let portsId = 0;
        let first = Math.floor(SHIP_VALUE / gameState.goodsInPort[0].volume) * gameState.prices[0][gameState.goodsInPort[0].name];
        first = (isNaN(first)) ? 0 : first;
        for (let p = 0; p < (gameState.ports.length - 1); p++) {
            for (let i = 0; i < gameState.goodsInPort.length; i++) {
                //let num = gameState.prices[p][gameState.goodsInPort[i].name] / gameState.goodsInPort[i].volume;
                let num = Math.floor(SHIP_VALUE / gameState.goodsInPort[i].volume) * gameState.prices[p][gameState.goodsInPort[i].name];
                if (num > first) {
                    goodsId = i;
                    portsId = p;
                    first = num;
                }
            }
        }
        return { portsId: portsId + 1, goodsId: goodsId }; //ID лучших порта и товара
    }

    function goodsSelection(port) {
        let id = 0;
        let first = Math.floor(freeValueInShip / gameState.goodsInPort[0].volume) * gameState.prices[port - 1][gameState.goodsInPort[0].name];
        first = (isNaN(first)) ? 0 : first;
        for (let i = 0; i < gameState.goodsInPort.length; i++) {
            //let num = gameState.prices[port - 1][gameState.goodsInPort[i].name] / gameState.goodsInPort[i].volume;
            let num = Math.floor(freeValueInShip / gameState.goodsInPort[i].volume) * gameState.prices[port - 1][gameState.goodsInPort[i].name];
            if (num > first) {
                first = num;
                id = i;
            }
        }
        return id; //id лучшего товара в конкретном порту
    }

    function amountCounting(id) {
        let maxAmount = Math.floor(freeValueInShip / gameState.goodsInPort[id].volume)
        if (maxAmount <= gameState.goodsInPort[id].amount) {
            step = 1;
            return maxAmount;
        }
        else {
            step = 2;
            return gameState.goodsInPort[id].amount;
        }
    }

}
