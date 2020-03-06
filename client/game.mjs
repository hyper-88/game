const SHIP_VALUE = 368;
const EARTH = '#';
let map;
let freeValueInShip;
let stepOfLoad = 1; //шаг погрузки товара
let prevStep = 0; //предыдущий ход в motion
let key = 'mainY'; //выбор движения в motion
let bestIDs; //id лучших порта и товара
let destinationCoord; //координаты направления


export function startGame(levelMap, gameState) {
    map = levelMap.split('\n')
    console.log('y', map.length, 'x', map[0].length);
    console.log('start', gameState);

    freeValueInShip = SHIP_VALUE; //свободное место на корабле (здесь для обнуления с новым уровнем)
}

export function getNextCommand(gameState) {
    // let c = gameState.ship.goods.length < gameState.prices[4 - 1].length - 1;
    //console.log(bestIDs);
    if (gameState.ship.goods.length === 0 || stepOfLoad === 2) {
        if (gameState.ship.x === gameState.ports[0].x && gameState.ship.y === gameState.ports[0].y) {
            let goodsAmount; //количество товара на погрузку              
            prevStep = 0;
            //ЗАГРУЗКА
            switch (stepOfLoad) {
                case 1: //загрузка первого товара
                    bestIDs = Selection();
                    let bestGoods = gameState.goodsInPort[bestIDs.goodsId].name;
                    goodsAmount = amountCounting(bestIDs.goodsId);
                    destinationCoord = getPortCoordinates(bestIDs.portsId); //координаты порта
                    freeValueInShip = freeValueInShip - goodsAmount * gameState.goodsInPort[bestIDs.goodsId].volume;
                    console.log('загружаю', bestGoods, goodsAmount, 'и отправляю в порт:', bestIDs.portsId);
                    return 'LOAD ' + bestGoods + ' ' + goodsAmount;
                case 2: //загрузка второго товара
                    console.log('case 2', Object.keys(gameState.prices[bestIDs.portsId - 1]).length - 1);
                    let bestSecondGoodsID = goodsSelection(bestIDs.portsId);
                    let bestSecondGoods = gameState.goodsInPort[bestSecondGoodsID].name;
                    goodsAmount = amountCounting(bestSecondGoodsID);
                    freeValueInShip = freeValueInShip - goodsAmount * gameState.goodsInPort[bestSecondGoodsID].volume;
                    console.log('догружаю', bestSecondGoods, goodsAmount, 'и отправляю в порт:', bestIDs.portsId);
                    return 'LOAD ' + bestSecondGoods + ' ' + goodsAmount;
            }

        } else {
            //ДОМОЙ...
            return motion(gameState.ship.x, gameState.ship.y);
        }
    } else {
        if (gameState.ship.x === gameState.ports[bestIDs.portsId].x && gameState.ship.y === gameState.ports[bestIDs.portsId].y) {
            //ПРОДАЖА
            destinationCoord = getHomeCoordinates();
            freeValueInShip = SHIP_VALUE;
            prevStep = 0;
            console.log('продаю', gameState.ship.goods[0].name, gameState.ship.goods[0].amount);
            return 'SELL ' + gameState.ship.goods[0].name + ' ' + gameState.ship.goods[0].amount;
        } else {
            //В ПОРТ...
            return motion(gameState.ship.x, gameState.ship.y);
        }
    }

    function getPortCoordinates(id) {
        return { x: gameState.ports[id].x, y: gameState.ports[id].y };
    }

    function getHomeCoordinates() {
        return { x: gameState.ports[0].x, y: gameState.ports[0].y };
    }

    function Selection() {
        let goodsId = 0;
        let portsId = 0;
        let first = Math.floor(SHIP_VALUE / gameState.goodsInPort[0].volume) * gameState.prices[0][gameState.goodsInPort[0].name];
        first = (isNaN(first)) ? 0 : first;
        for (let p = 0; p < (gameState.ports.length - 1); p++) {
            for (let i = 0; i < gameState.goodsInPort.length; i++) {
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
            let num = Math.floor(freeValueInShip / gameState.goodsInPort[i].volume) * gameState.prices[port - 1][gameState.goodsInPort[i].name];
            if (num > first) {
                first = num;
                id = i;
            }
        }
        return id; //id лучшего товара в конкретном порту
    }

    function amountCounting(goodsId) {
        let maxAmount = Math.floor(freeValueInShip / gameState.goodsInPort[goodsId].volume)
        if (maxAmount <= gameState.goodsInPort[goodsId].amount) {
            stepOfLoad = 1;
            return maxAmount;
        }
        else {
            stepOfLoad = 2;
            return gameState.goodsInPort[goodsId].amount;
        }
    }

    function motion(x, y) {
        let checkPiratesBeside = {
            n: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if (x === gameState.pirates[i].x && (y - 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            s: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if (x === gameState.pirates[i].x && (y + 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            w: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if ((x - 1) === gameState.pirates[i].x && y === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            e: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if ((x + 1) === gameState.pirates[i].x && y === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            }
        }

        let checkPiratesNearby = {
            n: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if (x === gameState.pirates[i].x && (y - 2) === gameState.pirates[i].y ||
                        (x - 1) === gameState.pirates[i].x && (y - 1) === gameState.pirates[i].y ||
                        (x + 1) === gameState.pirates[i].x && (y - 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            s: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if (x === gameState.pirates[i].x && (y + 2) === gameState.pirates[i].y ||
                        (x - 1) === gameState.pirates[i].x && (y + 1) === gameState.pirates[i].y ||
                        (x + 1) === gameState.pirates[i].x && (y + 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            w: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if ((x - 2) === gameState.pirates[i].x && y === gameState.pirates[i].y ||
                        (x - 1) === gameState.pirates[i].x && (y - 1) === gameState.pirates[i].y ||
                        (x - 1) === gameState.pirates[i].x && (y + 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            },
            e: function () {
                for (let i = 0; i < gameState.pirates.length; i++) {
                    if ((x + 2) === gameState.pirates[i].x && y === gameState.pirates[i].y ||
                        (x + 1) === gameState.pirates[i].x && (y - 1) === gameState.pirates[i].y ||
                        (x + 1) === gameState.pirates[i].x && (y + 1) === gameState.pirates[i].y) {
                        return true;
                    }
                }
                return false;
            }
        }

        switch (direction()) {
            case 'N':
                if (checkPiratesBeside.n()) {
                    return runAway();
                } else if (checkPiratesNearby.n()) {
                    return 'WAIT'
                } else {
                    return 'N';
                }
            case 'S':
                if (checkPiratesBeside.s()) {
                    return runAway();
                } else if (checkPiratesNearby.s()) {
                    return 'WAIT'
                } else {
                    return 'S';
                }
            case 'W':
                if (checkPiratesBeside.w()) {
                    return runAway();
                } else if (checkPiratesNearby.w()) {
                    return 'WAIT'
                } else {
                    return 'W';
                }
            case 'E':
                if (checkPiratesBeside.e()) {
                    return runAway();
                } else if (checkPiratesNearby.e()) {
                    return 'WAIT'
                } else {
                    return 'E';
                }
        }

        function runAway() {
            switch (direction()) {
                case 'N':
                case 'S':
                    if (x >= destinationCoord.x) {
                        if (map[y][x - 1] != EARTH) {
                            key = 'mainY';
                            prevStep = 0;
                            return 'W';
                        } else if (map[y][x + 1] != EARTH) {
                            key = 'mainY';
                            prevStep = 0;
                            return 'E';
                        } else if (direction() === 'N') {
                            return 'S';
                        } else {
                            return 'N';
                        }
                    } else {
                        if (map[y][x + 1] != EARTH) {
                            key = 'mainY';
                            prevStep = 0;
                            return 'E';
                        } else if (map[y][x - 1] != EARTH) {
                            key = 'mainY';
                            prevStep = 0;
                            return 'W';
                        } else if (direction() === 'N') {
                            return 'S';
                        } else {
                            return 'N';
                        }
                    }
                case 'W':
                case 'E':
                    if (y >= destinationCoord.y) {
                        if (map[y - 1][x] != EARTH) {
                            key = 'mainX';
                            prevStep = 0;
                            return 'N';
                        } else if (map[y + 1][x] != EARTH) {
                            key = 'mainX';
                            prevStep = 0;
                            return 'S';
                        } else if (direction() === 'W') {
                            return 'E';
                        } else {
                            return 'W';
                        }
                    } else {
                        if (map[y + 1][x] != EARTH) {
                            key = 'mainX';
                            prevStep = 0;
                            return 'S';
                        } else if (map[y - 1][x] != EARTH) {
                            key = 'mainX';
                            prevStep = 0;
                            return 'N';
                        } else if (direction() === 'W') {
                            return 'E';
                        } else {
                            return 'W';
                        }
                    }
            }
        }

        function direction() {
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
                for (let i = 1; i < map[0].length; i++) {
                    if ((x + i) < map[0].length) {
                        if (map[y - 1][x + 1] != EARTH && map[y][x + 1] != EARTH) {
                            key = 'mainX';
                            prevStep = 'e';
                            return 'E';
                        } else if (map[y - 1][x + i] != EARTH && map[y][x + 1] != EARTH && !(key === 'alt2X' && prevStep === 'w')) {
                            key = 'alt2X';
                            prevStep = 'e';
                            return 'E';
                        }
                    }
                    if ((x - i) >= 0) {
                        if (map[y - 1][x - 1] != EARTH && map[y][x - 1] != EARTH) {
                            key = 'mainX';
                            prevStep = 'w';
                            return 'W';
                        } else if (map[y - 1][x - i] != EARTH && map[y][x - 1] != EARTH && !(key === 'alt2X' && prevStep === 'e')) {
                            key = 'alt2X';
                            prevStep = 'w';
                            return 'W';
                        }
                    }
                }
                return altY();
            } else if (y < destinationCoord.y) {
                for (let i = 1; i < map[0].length; i++) {
                    if ((x + i) < map[0].length) {
                        if (map[y + 1][x + 1] != EARTH && map[y][x + 1] != EARTH) {
                            key = 'mainX';
                            prevStep = 'e';
                            return 'E';
                        } else if (map[y + 1][x + i] != EARTH && map[y][x + 1] != EARTH && !(key === 'alt2X' && prevStep === 'w')) {
                            key = 'alt2X';
                            prevStep = 'e';
                            return 'E';
                        }
                    }
                    if ((x - i) >= 0) {
                        if (map[y + 1][x - 1] != EARTH && map[y][x - 1] != EARTH) {
                            key = 'mainX';
                            prevStep = 'w';
                            return 'W';
                        } else if (map[y + 1][x - i] != EARTH && map[y][x - 1] != EARTH && !(key === 'alt2X' && prevStep === 'e')) {
                            key = 'alt2X';
                            prevStep = 'w';
                            return 'W';
                        }
                    }
                }
                return altY();
            } else {
                return altY();
            }
        }

        function alt2Y() {
            console.log('alt2Y');
            if (x > destinationCoord.x) {
                for (let i = 1; i < map.length; i++) {
                    if ((y + i) < map.length) {
                        if (map[y + 1][x - 1] != EARTH && map[y + 1][x] != EARTH) {
                            key = 'mainY';
                            prevStep = 's';
                            return 'S';
                        } else if (map[y + i][x - 1] != EARTH && map[y + 1][x] != EARTH && !(key === 'alt2Y' && prevStep === 'n')) {
                            key = 'alt2Y';
                            prevStep = 's';
                            return 'S';
                        }
                    }
                    if ((y - i) >= 0) {
                        if (map[y - 1][x - 1] != EARTH && map[y - 1][x] != EARTH) {
                            key = 'mainY';
                            prevStep = 'n';
                            return 'N';
                        } else if (map[y - i][x - 1] != EARTH && map[y - 1][x] != EARTH && !(key === 'alt2Y' && prevStep === 's')) {
                            key = 'alt2Y';
                            prevStep = 'n';
                            return 'N';
                        }
                    }
                }
                return altX();
            } else if (x < destinationCoord.x) {
                for (let i = 1; i < map.length; i++) {
                    if ((y + i) < map.length) {
                        if (map[y + 1][x + 1] != EARTH && map[y + 1][x] != EARTH) {
                            key = 'mainY';
                            prevStep = 's';
                            return 'S';
                        } else if (map[y + i][x + 1] != EARTH && map[y + 1][x] != EARTH && !(key === 'alt2Y' && prevStep === 'n')) {
                            key = 'alt2Y';
                            prevStep = 's';
                            return 'S';
                        }
                    }
                    if ((y - i) >= 0) {
                        if (map[y - 1][x + 1] != EARTH && map[y - 1][x] != EARTH) {
                            key = 'mainY';
                            prevStep = 'n';
                            return 'N';
                        } else if (map[y - i][x + 1] != EARTH && map[y - 1][x] != EARTH && !(key === 'alt2Y' && prevStep === 's')) {
                            key = 'alt2Y';
                            prevStep = 'n';
                            return 'N';
                        }
                    }
                }
                return altX();
            } else {
                return altX();
            }
        }
    }
}
