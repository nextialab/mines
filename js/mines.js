var columns = 20;
var rows = 15;
var edge = 40;
var _HIDDEN_ = 0;
var _FLAG_ = 1;
var _BOOM_ = 2;
var _SHOWING_ = 3;
var _PLAYING_ = 4;

var status = _PLAYING_;
var totalBombs = 25;

var grid = [];

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update
});

function generate() {
    for (var i = 0; i < columns; ++i) {
        grid[i] = [];
        for (var j = 0; j < rows; ++j) {
            grid[i][j] = {bomb: false, bombs: 0, status: _HIDDEN_};
            grid[i][j].sprite = game.add.sprite(i * edge, j * edge, 'tiles');
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

function preload() {
    game.load.spritesheet('tiles', 'assets/spritesheet.png', 40, 40);
}

function create() {
    generate();
    game.input.onTap.add(onTap, this);
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
}

function update() {

}

function checkCell(x, y) {
    var cell = grid[x][y];
    cell.status = _SHOWING_;
    cell.sprite.frame = _SHOWING_;
    if (cell.bombs == 0) {
        for (var i = -1; i <= 1; ++i) {
            for (var j = -1; j <= 1; ++j) {
                var xi = x + i;
                var yj = y + j;
                if (!(xi == x && yj == y) && xi >= 0 && xi < columns && yj >= 0 && yj< rows) {
                    var nextCell = grid[xi][yj];
                    if (!nextCell.bomb && nextCell.status == _HIDDEN_) {
                        checkCell(xi, yj);
                    }
                }
            }
        }
    } else {
        game.add.text(x * edge + 8, y * edge + 8, cell.bombs);
    }
}

function checkWin() {
    for (var i = 0; i < columns; ++i) {
        for (var j = 0; j < rows; ++j) {
            if (grid[i][j].status == _HIDDEN_) {
                return false;
            }
        }
    }
    return true;
}

function onTap(pointer, doubleTap) {
    if (status == _BOOM_) return;
    var x = Math.floor(pointer.x / edge);
    var y = Math.floor(pointer.y / edge);
    var cell = grid[x][y];
    if (pointer.leftButton.isDown) {
        if (cell.status == _HIDDEN_) {
            if (cell.bomb) {
                cell.sprite.frame = _BOOM_;
                cell.status = _BOOM_;
                status = _BOOM_;
                document.getElementById('lose').style.display = 'block';
            } else {
                checkCell(x, y);
            }
        }
    } else if (pointer.rightButton.isDown) {
        if (cell.status == _HIDDEN_ && totalBombs > 0) {
            cell.sprite.frame = _FLAG_;
            cell.status = _FLAG_;
            totalBombs--;
        } else if (cell.status == _FLAG_) {
            cell.sprite.frame = _HIDDEN_;
            cell.status = _HIDDEN_;
            totalBombs++;
        }
        document.getElementById('bombs').innerHTML = totalBombs;
    }
    if (checkWin()) {
        document.getElementById('win').style.display = 'block';
    }
}
