const SHIP_VALUE = 368;
const EARTH = '#';
let map;
let distanceToPorts = [];
let freeValueInShip;
let stepOfLoad = 'calculate and load'; //шаг погрузки товара
let bestPortId;

export function startGame(levelMap, gameState) {
    freeValueInShip = SHIP_VALUE; //свободное место на корабле (здесь для обнуления с новым уровнем)
    sortById(gameState.ports);   
    
    map = levelMap.split('\n');
    let mapMask = [];
    for (let i = 0; i < map.length; i++) {
        mapMask[i] = [...map[i]];
    }
    map = mapMask;
    console.log('start', gameState);
    for (let i = 1; i < gameState.ports.length; i++) {
        let transformedMap = getTransformedMap(gameState, i);
        distanceToPorts[i] = transformedMap[gameState.ports[0].y][gameState.ports[0].x];
        distanceToPorts[i] = (distanceToPorts[i] === 'H') ? -10 : distanceToPorts[i]; //определение недоступного порта
    }

    for (let i = 0; i < gameState.ports.length; i++) {
        
    }
}

function sortById(arr) {
    arr.sort((a, b) => a.portId > b.portId ? 1 : -1);
}

function getTransformedMap(gameState, id) {
    let squareOfMap = map.length + map[0].length;
    let mapForCalc = [];
    for (let i = 0; i < map.length; i++) {
        mapForCalc[i] = [...map[i]];
    }
    mapForCalc[gameState.ports[id].y][gameState.ports[id].x] = 0;

    for (let w = 0; w < squareOfMap; w++) {
        for (let i = 0; i < mapForCalc.length; i++) {
            for (let j = 0; j < mapForCalc[i].length; j++) {
                if (mapForCalc[i][j] === w) {
                    if ((j - 1) >= 0 && mapForCalc[i][j - 1] !== '#' && typeof (mapForCalc[i][j - 1]) !== 'number') {
                        mapForCalc[i][j - 1] = w + 1;
                    }
                    if ((i - 1) >= 0 && mapForCalc[i - 1][j] !== '#' && typeof (mapForCalc[i - 1][j]) !== 'number') {
                        mapForCalc[i - 1][j] = w + 1;
                    }
                    if ((j + 1) < mapForCalc[i].length && mapForCalc[i][j + 1] !== '#' && typeof (mapForCalc[i][j + 1]) !== 'number') {
                        mapForCalc[i][j + 1] = w + 1;
                    }
                    if ((i + 1) < mapForCalc.length && mapForCalc[i + 1][j] !== '#' && typeof (mapForCalc[i + 1][j]) !== 'number') {
                        mapForCalc[i + 1][j] = w + 1;
                    }
                }
            }

        }
    }
    return mapForCalc;
}

export function getNextCommand(gameState) {
    sortById(gameState.ports);
    
    if (gameState.ship.goods.length === 0 || (stepOfLoad === 'load continue' && gameState.goodsInPort.length > 0)) {
        if (gameState.ship.x === gameState.ports[0].x && gameState.ship.y === gameState.ports[0].y) {
            //ЗАГРУЗКА
            return mainLoad();
        } else {
            //ДОМОЙ...
            return motion(0);
        }
    } else {
        if (gameState.ship.x === gameState.ports[bestPortId + 1].x && gameState.ship.y === gameState.ports[bestPortId + 1].y) {
            //ПРОДАЖА
            freeValueInShip = SHIP_VALUE;
            return 'SELL ' + gameState.ship.goods[0].name + ' ' + gameState.ship.goods[0].amount;
        } else {
            //В ПОРТ...
            stepOfLoad = 'calculate and load';
            return motion(bestPortId + 1);
        }
    }

    function mainLoad() {
        let matchingGoods = getMatchingGoods();
        console.log('matchingGoods', matchingGoods)
        switch (stepOfLoad) {
            case 'calculate and load':
                bestPortId = chooseBestPort();
                if (bestPortId < 0) {
                    return 'WAIT';
                }
                return load();
            case 'load continue':
                return load();
        }

        function load() {
            let goodsIdForLoad = chooseBestGoods(bestPortId, freeValueInShip, matchingGoods);
            let amountOfGoods = countAmount(bestPortId, goodsIdForLoad, freeValueInShip);
            freeValueInShip = freeValueInShip - amountOfGoods * gameState.goodsInPort[goodsIdForLoad].volume;
            console.log('Загружаю', gameState.goodsInPort[goodsIdForLoad].name, amountOfGoods, 'в порт:', bestPortId + 1);
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
                        let amount = countAmount(i, goodsId, freeValue)
                        let countVol = amount * gameState.goodsInPort[goodsId].volume;
                        let cost = gameState.prices[i][gameState.goodsInPort[goodsId].name];
                        profit = profit + (amount * cost) / (2 * (1 + distanceToPorts[i + 1]));
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
            return portId; //на 1 меньше чем id порта в ports
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

        function countAmount(portId, goodsId, freeValue) {
            let maxAmount = Math.floor(freeValue / gameState.goodsInPort[goodsId].volume);
            if (maxAmount <= gameState.goodsInPort[goodsId].amount) {
                stepOfLoad = 'calculate and load';
                return maxAmount;
            }
            else {
                if (matchingGoods[portId].length === 1) {
                    stepOfLoad = 'calculate and load';
                } else {
                    stepOfLoad = 'load continue';
                }
                return gameState.goodsInPort[goodsId].amount;
            }
        }
    }

    function motion(id) {
        let x = gameState.ship.x;
        let y = gameState.ship.y;
        let transformedMap = getTransformedMap(gameState, id);

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
                    if (x >= gameState.ports[id].x) {
                        if ((x - 1) >= 0 && map[y][x - 1] != EARTH && !checkPiratesBeside.w() && !checkPiratesNearby.w()) {
                            return 'W';
                        } else if ((x + 1) < transformedMap[0].length && map[y][x + 1] != EARTH && !checkPiratesBeside.e() && !checkPiratesNearby.e()) {
                            return 'E';
                        } else if (direction() === 'N') {
                            return 'S';
                        } else {
                            return 'N';
                        }
                    } else {
                        if ((x + 1) < transformedMap[0].length && map[y][x + 1] != EARTH && !checkPiratesBeside.e() && !checkPiratesNearby.e()) {
                            return 'E';
                        } else if ((x - 1) >= 0 && map[y][x - 1] != EARTH && !checkPiratesBeside.w() && !checkPiratesNearby.w()) {
                            return 'W';
                        } else if (direction() === 'N') {
                            return 'S';
                        } else {
                            return 'N';
                        }
                    }
                case 'W':
                case 'E':
                    if (y >= gameState.ports[id].y) {
                        if ((y - 1) >= 0 && map[y - 1][x] != EARTH && !checkPiratesBeside.n() && !checkPiratesNearby.n()) {
                            return 'N';
                        } else if ((y + 1) < transformedMap.length && map[y + 1][x] != EARTH && !checkPiratesBeside.s() && !checkPiratesNearby.s()) {
                            return 'S';
                        } else if (direction() === 'W') {
                            return 'E';
                        } else {
                            return 'W';
                        }
                    } else {
                        if ((y + 1) < transformedMap.length && map[y + 1][x] != EARTH && !checkPiratesBeside.s() && !checkPiratesNearby.s()) {
                            return 'S';
                        } else if ((y - 1) >= 0 && map[y - 1][x] != EARTH && !checkPiratesBeside.n() && !checkPiratesNearby.n()) {
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
            let myPosition = transformedMap[y][x];

            if ((x - 1) >= 0 && transformedMap[y][x - 1] < myPosition) {
                return 'W';
            } else if ((y - 1) >= 0 && transformedMap[y - 1][x] < myPosition) {
                return 'N';
            } else if ((x + 1) < transformedMap[0].length && transformedMap[y][x + 1] < myPosition) {
                return 'E';
            } else if ((y + 1) < transformedMap.length && transformedMap[y + 1][x] < myPosition) {
                return 'S';
            }
        }
    }
}