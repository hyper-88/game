const SHIP_VALUE = 368;
const EARTH = '#';
let map;
let freeValueInShip;
let stepOfLoad = 'calculate and load'; //шаг погрузки товара
let prevStep = 0; //предыдущий ход в motion
let key = 'mainY'; //выбор движения в motion
let destinationCoord; //координаты направления 
let bestPortId;

export function startGame(levelMap, gameState) {
    map = levelMap.split('\n');
    console.log('start', gameState);
    freeValueInShip = SHIP_VALUE; //свободное место на корабле (здесь для обнуления с новым уровнем)
}

export function getNextCommand(gameState) {
    if (gameState.ship.goods.length === 0 || (stepOfLoad === 'load continue' && gameState.goodsInPort.length > 0)) {
        if (gameState.ship.x === gameState.ports[0].x && gameState.ship.y === gameState.ports[0].y) {
            prevStep = 0;
            //ЗАГРУЗКА
            return mainLoad();
        } else {
            //ДОМОЙ...
            return motion();
        }
    } else {
        if (gameState.ship.x === gameState.ports[bestPortId + 1].x && gameState.ship.y === gameState.ports[bestPortId + 1].y) {
            //ПРОДАЖА
            destinationCoord = getHomeCoordinates();
            freeValueInShip = SHIP_VALUE;
            prevStep = 0;
            console.log('продаю', gameState.ship.goods[0].name, gameState.ship.goods[0].amount);
            return 'SELL ' + gameState.ship.goods[0].name + ' ' + gameState.ship.goods[0].amount;
        } else {
            //В ПОРТ...
            return motion();
        }
    }

    function getPortCoordinates(id) {
        id++;
        return { x: gameState.ports[id].x, y: gameState.ports[id].y };
    }

    function getHomeCoordinates() {
        return { x: gameState.ports[0].x, y: gameState.ports[0].y };
    }

    function mainLoad() {
        let matchingGoods = getMatchingGoods();        

        switch (stepOfLoad) {
            case 'calculate and load':
                bestPortId = chooseBestPort();
                destinationCoord = getPortCoordinates(bestPortId);                
                return load();
            case 'load continue':
                return load();                
        }

        function load() {
            let goodsIdForLoad = chooseBestGoods(bestPortId, freeValueInShip, matchingGoods);
            let amountOfGoods = countAmount(goodsIdForLoad, freeValueInShip);
            freeValueInShip = freeValueInShip - amountOfGoods * gameState.goodsInPort[goodsIdForLoad].volume;
            console.log('Загружаю', gameState.goodsInPort[goodsIdForLoad].name, amountOfGoods)
            return 'LOAD ' + gameState.goodsInPort[goodsIdForLoad].name + ' ' + amountOfGoods;
        }

        function getMatchingGoods() {
            let availableGoods = [];
            for (let i = 0; i < gameState.prices.length; i++) {
                availableGoods[i] = [];
                for (let j = 0; j < gameState.goodsInPort.length; j++) {
                    if (typeof (gameState.prices[i][gameState.goodsInPort[j].name]) !== 'undefined') {
                        availableGoods[i].push(j);
                    }
                }
            }
            return availableGoods; // индексы товаров для каждого порта, которые можно продать из тех что есть в порту
        }

        function chooseBestPort() {
            let portId = -1;
            let maxProfit = 0;
            for (let i = 0; i < matchingGoods.length; i++) {
                let freeValue = SHIP_VALUE;
                let profit = 0;
                let matchingGoodsForCalculate = getMatchingGoods();
                for (let j = 0; j < matchingGoodsForCalculate[i].length; j++) {
                    let goodsId = chooseBestGoods(i, freeValue, matchingGoodsForCalculate);
                    if (goodsId >= 0) {
                        let amount = countAmount(goodsId, freeValue)
                        let countVol = amount * gameState.goodsInPort[goodsId].volume;
                        let cost = gameState.prices[i][gameState.goodsInPort[goodsId].name];
                        profit = profit + amount * cost;
                        if (profit > maxProfit) {
                            portId = i;
                            maxProfit = profit;
                        }
                        freeValue = freeValue - countVol;
                        let index = matchingGoodsForCalculate[i].indexOf(goodsId);
                        if (index >= 0) {
                            matchingGoodsForCalculate[i].splice(index, 1);
                        }
                    }
                }
            }
            return portId;
        }

        function chooseBestGoods(portId, freeValue, matchingGoods) {
            let goodsId = -1;
            let first = 0;
            for (let j = 0; j < matchingGoods[portId].length; j++) {
                let vol = gameState.goodsInPort[matchingGoods[portId][j]].volume;
                let cost = gameState.prices[portId][gameState.goodsInPort[matchingGoods[portId][j]].name];
                let num = Math.floor(freeValue / vol) * cost;
                if (num > first) {
                    first = num;
                    goodsId = matchingGoods[portId][j];
                }
            }
            return goodsId; //id товара из списка совпадений в данном порту portId
        }

        function countAmount(goodsId, freeValue) {
            let maxAmount = Math.floor(freeValue / gameState.goodsInPort[goodsId].volume);
            if (maxAmount <= gameState.goodsInPort[goodsId].amount) {
                stepOfLoad = 'calculate and load';
                return maxAmount;
            }
            else {
                if (matchingGoods[goodsId].length === 1) {
                    stepOfLoad = 'calculate and load';
                } else {
                    stepOfLoad = 'load continue';
                }
                return gameState.goodsInPort[goodsId].amount;
            }
        }
    }

    function motion() {
        let x = gameState.ship.x;
        let y = gameState.ship.y;
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
                    return 'WAIT';
                } else {
                    return 'N';
                }
            case 'S':
                if (checkPiratesBeside.s()) {
                    return runAway();
                } else if (checkPiratesNearby.s()) {
                    return 'WAIT';
                } else {
                    return 'S';
                }
            case 'W':
                if (checkPiratesBeside.w()) {
                    return runAway();
                } else if (checkPiratesNearby.w()) {
                    return 'WAIT';
                } else {
                    return 'W';
                }
            case 'E':
                if (checkPiratesBeside.e()) {
                    return runAway();
                } else if (checkPiratesNearby.e()) {
                    return 'WAIT';
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
