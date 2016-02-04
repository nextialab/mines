var columns = 20;
var rows = 15;
var edge = 40;
var _HIDDEN_ = 0;
var _SHOWING_ = 1;
var _BOOM_ = 2;
var _PLAYING_ = 3;

var status = _PLAYING_;
var flags = 0;
var totalBombs = 50;

var grid = [];

function generate() {
    for (var i = 0; i < columns; ++i) {
        grid[i] = [];
        for (var j = 0; j < rows; ++j) {
            grid[i][j] = {bomb: false, bombs: 0, status: _HIDDEN_};
        }
    }
    var bombs = 0;
    while (bombs < totalBombs) {
        var posX = Math.floor(Math.random() * columns);
        var posY = Math.floor(Math.random() * rows);
        if (!grid[posX][posY].bomb) {
            grid[posX][posY].bomb = true;
            bombs++;
        }
    }
    for (var i = 0; i < columns; ++i) {
        for (var j = 0; j < rows; ++j) {
            var count = 0;
            for (var x = -1; x <= 1; ++x) {
                for (var y = -1; y <= 1; ++y) {
                    var ix = i + x;
                    var jy = j + y;
                    if (!(ix == i && jy == j) && ix >= 0 && ix < columns && jy >= 0 && jy < rows) {
                        if (grid[ix][jy].bomb) {
                            count++;
                        }
                    }
                }
            }
            grid[i][j].bombs = count;
        }
    }
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update
});

function preload() {
    game.load.image('cell', 'assets/cell.png');
    game.load.image('flag', 'assets/flag.png');
    game.load.image('clear', 'assets/clear.png');
    game.load.image('boom', 'assets/boom.png');
}

function draw() {
    for (var i = 0; i < columns; ++i) {
        for (var j = 0; j < rows; ++j) {
            switch(grid[i][j].status) {
                case _HIDDEN_:
                    game.add.sprite(i * edge, j * edge, 'cell');
                    break;
                case _SHOWING_:
                    if (grid[i][j].bomb) {
                        game.add.sprite(i * edge, j * edge, 'flag');
                    } else if(grid[i][j].bombs > 0) {
                        game.add.sprite(i * edge, j * edge, 'clear');
                        game.add.text(i * edge + 12, j * edge + 6, grid[i][j].bombs, { fontSize: '28px', fill: '#000' });
                    } else {
                        game.add.sprite(i * edge, j * edge, 'clear');
                    }
                    break;
                case _BOOM_:
                    game.add.sprite(i * edge, j * edge, 'boom');
                    break;
            }
        }
    }
}

function create() {
    generate();
    draw();
    game.input.onTap.add(onTap, this);
}

function update() {

}

function checkCell(x, y) {
    grid[x][y].status = _SHOWING_;
    if (grid[x][y].bombs == 0) {
        for (var i = -1; i <= 1; ++i) {
            for (var j = -1; j <= 1; ++j) {
                var xi = x - i;
                var yj = y - j;
                if (!(xi == x && yj == y) && xi >= 0 && xi < columns && yj >= 0 && yj< rows) {
                    if (!grid[xi][yj].bomb && grid[xi][yj].status != _HIDDEN_) {
                        checkCell(xi, yj);
                    }
                }
            }
        }
    }
}

function onTap(pointer, doubleTap) {
    if (status == _BOOM_) return;
    var x = Math.floor(pointer.x / edge);
    var y = Math.floor(pointer.y / edge);
    if (doubleTap) {

    } else {
        if (grid[x][y].status == _HIDDEN_) {
            if (grid[x][y].bomb) {
                grid[x][y].status = _BOOM_;
                status = _BOOM_;
            } else {
                checkCell(x, y);
            }
        }
    }
    draw();
}
