// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDQlFvV6VO61JURetchIdEMzXOUlE3u0lE",
    authDomain: "tetrix-fa956.firebaseapp.com",
    databaseURL: "https://tetrix-fa956-default-rtdb.firebaseio.com",
    projectId: "tetrix-fa956",
    storageBucket: "tetrix-fa956.appspot.com",
    messagingSenderId: "118650773032",
    appId: "1:118650773032:web:1a8e94cef925f888639f1d",
    measurementId: "G-2Y7XXFRN49"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();
let database = firebase.database();

//<editor-fold desc="Account variables">

let highScore = 0;
let screenName = null;
let gamesWon = 0;

//e (change)

let canvas;
let c;

//</editor-fold>

//Auth stuff

function signUp(){

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var newScreenName = document.getElementById("screenName").value;
    if(newScreenName == null){
        newScreenName = "Player1"
    }

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.then(
        function() {

            const promise2 =  auth.signInWithEmailAndPassword(email, password);
            promise2.then(

                function() {

                    const promise3 = database.ref("accounts/" + auth.currentUser.uid).set({
                        highScore: 0,
                        screenName: newScreenName,
                        gamesWon: 0,
                    });

                    promise3.then(function (){
                        alert("Account created!");
                        window.location.assign("updateInfo.html");
                        //console.log(auth.currentUser.uid)

                    }, null)
                },
                e => alert("Sign up failure - " + e.message))
        },
        e => alert("Sign up failure - " + e.message))



}

function logIn(){
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.then(
        function(){
            window.location.assign("updateInfo.html")
        },

        e => alert(e.message)
    );
}

function updateAccountInfo(){
    let newEmail =  document.getElementById("username").value;
    let newPassword =  document.getElementById("password").value;
    let screenName =  document.getElementById("screenName").value;


    auth.currentUser.updatePassword(newPassword).then(
        function(){
            document.getElementById("password").value = ""
            alert("Password updated successfully")

            auth.currentUser.updateEmail(newEmail).then(
                function(){
                    document.getElementById("username").value = "";
                    alert("Email updated successfully")

                    if(screenName != "") {
                        database.ref("accounts/" + auth.currentUser.uid + "/screenName").set(screenName).then(
                            function () {
                                document.getElementById("screenName").value = "";
                                alert("Screen Name updated successfully")
                            },
                            e => alert("Screen name update error: " + e)
                        );
                    }
                    else{
                        alert("Invalid screen name error")
                    }

                },
                e => alert("Username update error: " + e)
            );

        },
        e => alert("Password update error: " + e)
    );


}

function signOut(){
    auth.signOut();
    window.location.assign("index.html");
}

function joinRoom(){
    //START HERE
}

auth.onAuthStateChanged(function(){
    if(auth.currentUser != null){
        if(location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "updateInfo.html") {
            firebase.database().ref("accounts/" + firebase.auth().currentUser.uid + "/" + "screenName").once("value", function (snapshot) {
                screenName = snapshot.val()
            }).catch(e => console.log(e.value)).then(function () {

                document.getElementById("welcome").textContent = "WELCOME, " + screenName.toUpperCase();

            });

            firebase.database().ref("accounts/" + firebase.auth().currentUser.uid + "/" + "highScore").once("value", function (snapshot) {
                highScore = snapshot.val()
            }).then(
                function () {
                    document.getElementById("highScore").textContent = "High Score: " + highScore;
                },
                e => console.log(e.value)
            );

            firebase.database().ref("accounts/" + firebase.auth().currentUser.uid + "/" + "gamesWon").once("value", function (snapshot) {
                gamesWon = snapshot.val()
            }).then(
                function () {
                    document.getElementById("gamesWon").textContent = "Games Won: " + gamesWon;
                },
                e => console.log(e.value)
            );
        }
        if(location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "play.html") {
            firebase.database().ref("accounts/" + firebase.auth().currentUser.uid + "/" + "screenName").once("value", function (snapshot) {
                screenName = snapshot.val()
            }).catch(e => console.log(e.value)).then(function () {

                document.getElementById("welcome").textContent = "WELCOME, " + screenName.toUpperCase();

            });
        }

        if(location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "index.html" && document.getElementById("email").value == "") { //ensures that user will not be taken to updateInfo
            // before the code assigns them a username in database
            window.location.assign("updateInfo.html");
        }

        if(location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "gameBoard.html"){
            startGame();
        }

    }
})

//<editor-fold desc="Basic game variables">
let blockSize = 30; //px size for each block

let gridX = (window.innerWidth / 2) - (5 * (blockSize + (blockSize / 6))); //Coords of grid at top left
let gridY = (window.innerHeight / 2) - (10 * (blockSize + (blockSize / 6)));

let speed = 1;

let currentBlock = 1; // correlates with blocks array

let blocks = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"] // determines order of blocks given to player

let inMotion = true;

let dead = [[null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null,null]];

let host = true;

let playersInGame = [];

let playerNumber = 1;

let movingBlocks = [undefined, undefined];

let score = 0;

let rotationLocation = [
    [
        [0,1,1,1,2,1,3,1], //(0,2), (1,2), etc.
        [1,0,1,1,1,2,1,3],
        [0,2,1,2,2,2,3,2],
        [2,0,2,1,2,2,2,3]
    ],// "cyan"
    [
        [0,1,0,2,1,1,2,1],
        [1,1,1,2,1,3,2,3],
        [1,2,2,2,3,1,3,2],
        [1,0,2,0,2,1,2,2]
    ],// "blue"
    [
        [0,0,0,1,1,1,2,1],
        [0,3,1,3,1,2,1,1],
        [3,3,3,2,2,2,1,2],
        [2,0,2,1,2,2,3,0]
    ],// "orange"
    [],// "yellow"
    [
        [0,0,1,0,1,1,2,1],
        [0,3,0,2,1,2,1,1],
        [3,3,2,3,2,2,1,2],
        [3,0,3,1,2,1,2,2]
    ],// "green"
    [
        [0,2,1,2,1,3,2,2],
        [2,1,2,2,2,3,3,2],
        [1,1,2,0,2,1,3,1],
        [0,1,1,0,1,1,1,2]
    ],// "purple"
    [
        [0,1,1,0,1,1,2,0],
        [0,1,0,2,1,2,1,3],
        [1,3,2,2,2,3,3,2],
        [2,0,2,1,3,1,3,2]
    ]// "red"
]

let square = {
    color: "red",
    x: 0,
    y: 0,
}

const block = {
    color: "red",
    x: 1,
    y: 1,
    direct: 4,
    squares: [[null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]], //Array that defines each square in the block

    moveBlock: function (lrd) {
        let blocked = false;

        if (lrd == "d") {
            blocked = true;
            if(!this.isTouchingDead()) {
                this.y++;
                blocked = false;
            }
            else{
                return "touchingDead";
            }
        }

        if (lrd == "r") {
            for (var row = 0; row < 4; row++) {
                for (var column = 0; column < 4; column++) {

                    if (this.squares[row][column] != null) {

                        if (this.x + column + 1 > dead[0].length || dead[this.y + row - 1][this.x + column] != null) {
                            blocked = true;
                        }
                    }

                }
            }
            if (!blocked) {
                this.x++;
            }
        }

        if (lrd == "l") {
            for (var row = 0; row < 4; row++) {
                for (var column = 0; column < 4; column++) {

                    if (this.squares[row][column] != null) {
                        if (this.x + column - 1 < 1 || dead[this.y + row - 1][this.x + column - 2] != null) {
                            blocked = true;
                        }
                    }
                }
            }
            if (!blocked) {
                this.x--;
            }
        }

        return !blocked;
    },

    isTouchingDead: function () {
        let touchingDead = false;
        for (var row = 0; row < 4; row++) {
            for (var column = 0; column < 4; column++) {

                if (this.squares[row][column] != null) { //checks if is touching dead blocks
                    if ((this.y + row < 20) && (dead[this.y + row][this.x + column - 1] != null)) {
                        touchingDead = true;
                    } else if (this.y + row == 20) { // checks if has hit bottom ( row 21 )
                        touchingDead = true;
                    }
                }

            }
        }

        if (touchingDead) {
            for (var row = 0; row < 4; row++) {
                for (var column = 0; column < 4; column++) {
                    if (this.squares[row][column] != null) {
                        dead[this.y + row - 1][this.x + column - 1] = this.squares[row][column]
                    }
                }
            }


            let lines = isLineClear();
            if(lines != undefined){
                for(let i = 0; i < lines.length; i++){ //clears all complete lines, top to bottom
                    //console.log(lines[i]);
                    clearLine(lines[i]);
                }
            }

            database.ref("match2/grid").update(deadToObject());


            redraw();
            /*
            if(currentBlock == blocks.length - 1){
                currentBlock = 0;
            }
            else{
                currentBlock ++;
            }
            let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
            database.ref("match2/movingBlocks/" + playerNumber).update(updatedBlock);
            */




        }
        return touchingDead;
    },

    rotateBlockAlt: function(direction){

        if(this.color != "yellow") {

            let target = this.direct + direction;
            if (target < 1) {
                target = (this.direct + direction) % 4 + 4;
            } else if (target > 4) {
                target = (this.direct + direction) % 4;
            }
            ;

            let coords = rotationLocation[blocks.indexOf(this.color)][target - 1];
            let blocked = false;

            for (let i = 0; i < 4; i++) {

                if ((this.y + coords[2 * i] - 1) > 19 ||
                    (this.x + coords[(2 * i) + 1] - 1) > dead[0].length - 1 ||
                    (this.x + coords[(2 * i) + 1] - 1) < 0) {
                    blocked = true;
                    return false; //indicates not successful
                }

                if (dead[this.y + coords[2 * i] - 1][this.x + coords[(2 * i) + 1] - 1] != null) {
                    blocked = true;
                    return false;
                }


            }




            this.squares = [[null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null]]; //resets array of squares

            for (let i = 0; i < 4; i++) {
                this.squares[coords[2 * i]][coords[(2 * i) + 1]] = Object.create(square);
                this.squares[coords[2 * i]][coords[(2 * i) + 1]].color = this.color;
            }

            this.direct = target;

            return true;




        }
        else{
            return false;
        }

    }
}
//</editor-fold>

function isLineClear(){ //returns array of all complete lines, order from top to bottom
    let result = [];
    for(let row = 0; row < 20; row++){
        let rowFull = true;
        for(let column = 0; column < dead[0].length; column++){
            if(dead[row][column] == null){ //if any spaces are empty per row, it cannot be full
                rowFull = false
            }
        }
        if(rowFull){
            result.push(row);
        }
    };
    return result;
}

function clearLine(line){
    for(let row = (line - 1); row > 0; row--){ //Clears the line given + shifts all blocks above it down
        for(let column = 0; column < dead[0].length; column ++){
            dead[row + 1][column] = null;
            if(dead[row][column] != null) {
                dead[row + 1][column] = Object.create(square);
                dead[row + 1][column].color = dead[row][column].color;
            }
        }
    }
    score += 100;
    database.ref("match2/score").set(score / 100);
}

function createBlock(inputColor, inputX, inputY){

    if(inMotion) {
        let newBlock = {};
        Object.assign(newBlock, block);
        newBlock.x = inputX;
        newBlock.y = inputY;
        newBlock.color = inputColor;
        newBlock.squares = [[null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]]; // This is necessary, because with the Object.create() function, the new object simply is a pointer to the block object.
        //so, without this,any previous squares in the array are saves and will merge with the block being created.

        if (inputColor == "cyan") {

            newBlock.squares[2][0] = Object.create(square);
            newBlock.squares[2][0].color = "cyan";

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "cyan";

            newBlock.squares[2][2] = Object.create(square);
            newBlock.squares[2][2].color = "cyan";

            newBlock.squares[2][3] = Object.create(square);
            newBlock.squares[2][3].color = "cyan";

        }

        if (inputColor == "yellow") {

            newBlock.squares[1][1] = Object.create(square);
            newBlock.squares[1][1].color = "yellow";

            newBlock.squares[1][2] = Object.create(square);
            newBlock.squares[1][2].color = "yellow";

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "yellow";

            newBlock.squares[2][2] = Object.create(square);
            newBlock.squares[2][2].color = "yellow";

        }

        if (inputColor == "purple") {

            newBlock.squares[0][1] = Object.create(square);
            newBlock.squares[0][1].color = "purple";

            newBlock.squares[1][0] = Object.create(square);
            newBlock.squares[1][0].color = "purple";

            newBlock.squares[1][1] = Object.create(square);
            newBlock.squares[1][1].color = "purple";

            newBlock.squares[1][2] = Object.create(square);
            newBlock.squares[1][2].color = "purple";

        }

        if (inputColor == "blue") {

            newBlock.squares[1][0] = Object.create(square);
            newBlock.squares[1][0].color = "blue";

            newBlock.squares[2][0] = Object.create(square);
            newBlock.squares[2][0].color = "blue";

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "blue";

            newBlock.squares[2][2] = Object.create(square);
            newBlock.squares[2][2].color = "blue";
        }

        if (inputColor == "green") {

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "green";

            newBlock.squares[2][2] = Object.create(square);
            newBlock.squares[2][2].color = "green";

            newBlock.squares[3][0] = Object.create(square);
            newBlock.squares[3][0].color = "green";

            newBlock.squares[3][1] = Object.create(square);
            newBlock.squares[3][1].color = "green";
        }

        if (inputColor == "red") {

            newBlock.squares[2][0] = Object.create(square);
            newBlock.squares[2][0].color = "red";

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "red";

            newBlock.squares[3][1] = Object.create(square);
            newBlock.squares[3][1].color = "red";

            newBlock.squares[3][2] = Object.create(square);
            newBlock.squares[3][2].color = "red";
        }

        if (inputColor == "orange") {

            newBlock.squares[2][0] = Object.create(square);
            newBlock.squares[2][0].color = "orange";

            newBlock.squares[2][1] = Object.create(square);
            newBlock.squares[2][1].color = "orange";

            newBlock.squares[2][2] = Object.create(square);
            newBlock.squares[2][2].color = "orange";

            newBlock.squares[3][0] = Object.create(square);
            newBlock.squares[3][0].color = "orange";
        }


        /*

        let originalBlocks = null;

        for(var row = 0; row < 4; row++) {
            for (var column = 0; column < 4; column++) {
                if(newBlock.squares[row][column] == null){
                    newBlock.squares[row][column] = 0;
                }
            }
        }



                database.ref('match2/').once('value').then(function (snapshot)  {
            if(snapshot.val() != null){
                originalBlocks = snapshot.val().allMovingBlocks;
            }
        })

        if(originalBlocks != null){
            let intermediate = Object.values(originalBlocks);
            intermediate.push({
                color: newBlock.color,
                x: newBlock.x,
                y: newBlock.y,
                squares: newBlock.squares
            });
            Object.assign({},intermediate);
            originalBlocks = intermediate;
        }
        else{
            originalBlocks = Object.assign({}, [{
                color: newBlock.color,
                x: newBlock.x,
                y: newBlock.y,
                squares: newBlock.squares
            }]);
        }


                database.ref("match2/").set({
            allMovingBlocks: originalBlocks
        });

        */

        let failedCreate = false;
        for (let row = 0; row < 4; row++) {
            for (let column = 0; column < 4; column++) {
                if (newBlock.squares[row][column] != null && dead[inputY + row][inputX + column] != null) {
                    inMotion = false;
                    failedCreate = true;
                    gameOver();
                }
                ;
            }
        }
        if (failedCreate) {
            return null;
        } else {
            return newBlock;
        }
    }


}



function redraw(){

    c.clearRect(0, 0, canvas.width, canvas.height)

    c.font = "30px Orbitron";
    c.color = "white";
    c.fillStyle = "white";
    c.fillText("Score: " + score, canvas.width - ((20 * 6) + (25 * score.toString().length)), 50);

    let grid = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    let width = dead[0].length + 1; //Using "0" system, this finds width of the grid
    for (row = 0; row < 20; row++) {
        for (column = 0; column < width - 1; column++) { // Because firebase hates 0, must use 1 since this is the first row of the array
            grid[row][column] = null;
        }
    }

    var distX = 0;
    var distY = 0;
    //represents a blank spots
    /*
        let allMovingBlocks = [];


                database.ref('match2/').once('value').then(function (snapshot)  {
            if(snapshot.val() != null){
                allMovingBlocks = Object.values(snapshot.val().allMovingBlocks);
            }
        })

        for(var blockNum = 0; blockNum < allMovingBlocks.length; blockNum++) {
            for (var row = 0; row < 4; row++) {
                for (var column = 0; column < 4; column++) {
                    if (allMovingBlocks[blockNum].squares[row][column] == 0) {
                        allMovingBlocks[blockNum].squares[row][column] = null;
                    }
                }
            }
        }

     */

    for(var row = 1; row <= 20; row++){
        for(var column = 1; column <= dead[0].length; column++){

            var color = "white";
            var belongsToPlayer = false;

            for(var blockNum = 0; blockNum < movingBlocks.length; blockNum++) { //checks to see if there is a block in motion in this square

                if (movingBlocks[blockNum] != undefined &&
                    column >= movingBlocks[blockNum].x && column <= (movingBlocks[blockNum].x + 3)
                    && row >= movingBlocks[blockNum].y && row <= (movingBlocks[blockNum].y + 3)) {

                    if (movingBlocks[blockNum].squares[row - movingBlocks[blockNum].y][column - movingBlocks[blockNum].x] != null) {
                        color = movingBlocks[blockNum].color;


                        if(blockNum == playerNumber - 1){
                            belongsToPlayer = true;
                        }
                        else{
                            grid[row-1][column-1] = color;
                        }
                    }
                }

            }

            if (dead[row-1][column-1] != null){ //checks to see if there is a dead square here
                color = dead[row-1][column-1].color;
            }



            c.strokeStyle = color;
            c.lineWidth = blockSize / 15;
            c.shadowColor = color;
            c.shadowBlur = 14;
            c.shadowOffsetX = 1;
            c.shadowOffsetY = 1;
            if(color == "white"){
                c.strokeRect(gridX + distX, gridY + distY, blockSize, blockSize);
            }
            else{


                if(!belongsToPlayer) {
                    c.strokeRect(gridX + distX, gridY + distY, blockSize, blockSize);
                }
                else{
                    c.shadowColor = color;
                    c.shadowBlur = 14;
                    c.shadowOffsetX = 1;
                    c.shadowOffsetY = 1;
                    c.fillStyle = color;
                    c.fillRect(gridX + distX, gridY + distY, blockSize, blockSize);
                }}


            distX += (blockSize + (blockSize / 6));
        }
        distX = 0;
        distY += (blockSize + (blockSize / 6));
    }

    //console.log(grid);

    for(var row = 0; row < 4; row++) {
        for (var column = 0; column < 4; column++) {
            if(movingBlocks[playerNumber - 1] != undefined
                && movingBlocks[playerNumber - 1].squares[row][column] != null
                && grid[movingBlocks[playerNumber - 1].y + row - 1][movingBlocks[playerNumber - 1].x + column - 1] != null
                && grid[movingBlocks[playerNumber - 1].y + row - 1][movingBlocks[playerNumber - 1].x + column - 1] != movingBlocks[playerNumber - 1].color){

                let distX = (blockSize + (blockSize / 6)) * (movingBlocks[playerNumber - 1].x + column - 1);
                let distY = (blockSize + (blockSize / 6)) * (movingBlocks[playerNumber - 1].y + row - 1);


                c.shadowColor = grid[movingBlocks[playerNumber - 1].y + row - 1][movingBlocks[playerNumber - 1].x + column - 1];
                c.shadowBlur = 14;
                c.shadowOffsetX = 1;
                c.shadowOffsetY = 1;
                c.fillStyle = grid[movingBlocks[playerNumber - 1].y + row - 1][movingBlocks[playerNumber - 1].x + column - 1];
                c.fillRect(gridX + distX, gridY + distY, blockSize, blockSize);

            }
        }
    }


}

function cadence(){

    if(host && inMotion) {

        setTimeout(function () {

                for(let i = 0; i < movingBlocks.length; i++){
                    if(movingBlocks[i] != null){

                        let movedBlock = movingBlocks[i].moveBlock("d");

                        if(movedBlock == "touchingDead"){
                            bottomedBlock((i + 1), null)
                        }
                        else{
                            database.ref("match2/movingBlocks/" + (i + 1)).update(blockToObject(movingBlocks[i]));
                        }// Regular downward movement for both host and client

                    }
                }

                redraw();
                cadence();

            },
            500);

    }

}

function gameOver(message){
    let alertMessage = "Game over!"
    if(message != null){
        alertMessage += " - " + message
    }
    if(host){
        database.ref("match2").remove().then(
            function(){
                alert(alertMessage);
                window.location.assign("play.html");
            }
        )
    }
    else{
        alert(alertMessage);
        window.location.assign("play.html");
    }

} //NEEDS TO BE CODED - END BEHAVIOR

// END OF BASIC GAME CODE





//<editor-fold desc="Initialize basic game">

function startGame() {

    canvas = document.querySelector('canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    c = canvas.getContext('2d');

    redraw();

    document.addEventListener("keydown", move);

    //DB Initialize event listeners
    database.ref("match2/numPlayers").once("value").then(function (snapshot) { //Warning - may be async, may need promise
        if (snapshot.val() != undefined) { // If match is already created, set to client

            host = false;
            playerNumber = snapshot.val() + 1;

            database.ref("match2/numPlayers").set(playerNumber); //Increases numPlayers by 1

            database.ref("match2/players/player" + playerNumber).set({ //Sets up player in DB
                request: "",
                currentBlock: 1,
                index: playerNumber
            });

            database.ref("match2/numBlocks").on("value", clientPlayerListener);

            database.ref("match2/score").on("value", clientScoreListener);

            database.ref("match2/grid").on("value", clientGridHandler);

            database.ref("match2/players/player" + playerNumber).onDisconnect().update({request: "remove"});

            clientPlayerListener();

        } else {

            database.ref("match2/").set({ //Initializes match in DB
                movingBlocks: 0,
                numBlocks: 0,
                numPlayers: 1,
                score: 0,
                grid: deadToObject(),
            });

            database.ref("match2").onDisconnect().set(null);

            database.ref("match2/numPlayers").on("value", hostPlayerListener);

            cadence();
        }
    });

}

//</editor-fold>

//Handlers for various changes in DB

function clientPlayerListener(numBlocks){ //Only activates listener to player when they create a block
    if(numBlocks != undefined) {

        //console.log(numBlocks.val());
        if (numBlocks.val() >= 1) {

            database.ref("match2/numPlayers").once("value").then(function (numPlayers) {
                database.ref("match2/movingBlocks").once("value").then(function (movingBlocksDB) {

                    let oldPlayersInGame = playersInGame.length;

                    for (let i = 1; i <= Math.max(oldPlayersInGame, numPlayers.val()); i++) {

                        if (!playersInGame.includes("player" + i)) { //First tests if player is already accounted for

                            if (movingBlocksDB.val()[i] != undefined) { //Then tests if a specific player actually has a block
                                database.ref("match2/movingBlocks/" + i).on("value", clientMovingBlocksHandler);
                                //console.log(i);
                                playersInGame.push("player" + i);
                            }

                        } else if (i > movingBlocksDB.val().length || (playersInGame.includes("player" + i) && movingBlocksDB.val()[i] == undefined)) {
                            if ((i) == playerNumber) { //checks if booted player was themself
                                alert("You have been kicked from this room");
                                document.removeEventListener("keydown", move);
                            }
                            clientRemovePlayer(i);
                        }


                    }

                })
            })

        }
    }
}

function clientMovingBlocksHandler(snapshot){
    if(snapshot.val() != 0 && snapshot.val() != undefined) {//Starts on 1 and ends on length + 1, since the index of movingBlocks in Firebase is up 1 number - due to no 0 property name rule

        let i = snapshot.val().index;
        movingBlocks[i - 1] = objectToBlock(snapshot.val());
        //console.log(i);
        //console.log(snapshot.val())
        redraw();

    }
}

function clientGridHandler(snapshot){
    //console.log("working hard!2")
    if(snapshot.val() == null){
        gameOver("Host left match");
    }
    dead = objectToDead(snapshot);
    gridX = (window.innerWidth / 2) - ((dead[0].length / 2) * (blockSize + (blockSize / 6)));
    redraw();
}

function clientScoreListener(snapshot){
    score = snapshot.val() * 100;
    redraw(); // done so that score will show after canvas refresh
}

function hostPlayerHandler(snapshot){

    if(inMotion) {

        let i = snapshot.val().index;
        //console.log(i)
        if (snapshot.val().request == "n") { //TEMP -  Players will not be able to make own blocks
            let newBlock = false;
            if (movingBlocks[i - 1] == undefined) {
                newBlock = true;
            }

            movingBlocks[i - 1] = createBlock(blocks[snapshot.val().currentBlock], (((i - 1) * 10) + 4), 1);
            redraw();
            let newCurrentBlock = snapshot.val().currentBlock;
            if (snapshot.val().currentBlock == blocks.length - 1) {
                newCurrentBlock = 0;
            } else {
                newCurrentBlock++;
            }
            let updatedBlock = blockToObject(movingBlocks[i - 1]);
            updatedBlock["index"] = i;
            if (newBlock) {
                let oldNumBlocks = 0;
                database.ref("match2/numBlocks").once("value").then(function (snapshot) {
                    oldNumBlocks = snapshot.val();
                    database.ref("match2").update({numBlocks: oldNumBlocks + 1});

                })

            }
            database.ref("match2/movingBlocks/" + i).update(updatedBlock);
            database.ref("match2/players/player" + i).update({
                currentBlock: newCurrentBlock,
                request: ""
            });
        }
        if (snapshot.val().request == "r") {
            if (movingBlocks[i - 1].moveBlock("r")) {
                redraw();
                database.ref("match2/movingBlocks/" + (i) + "/x").set(movingBlocks[i - 1].x);
            }
            database.ref("match2/players/player" + i).update({
                request: ""
            });
        }
        if (snapshot.val().request == "l") {
            if (movingBlocks[i - 1].moveBlock("l")) {
                redraw();
                database.ref("match2/movingBlocks/" + (i) + "/x").set(movingBlocks[i - 1].x);
            }
            database.ref("match2/players/player" + i).update({
                request: ""
            });
        }
        if (snapshot.val().request == "d") {

            let movedBlock = movingBlocks[i - 1].moveBlock("d");

            if (movedBlock == "touchingDead") {

                bottomedBlock(i, snapshot.val().currentBlock);

            } //This will be called if a block hits the ground when moved down
            if (movedBlock == true) {


                database.ref("match2/movingBlocks/" + (i) + "/y").set(movingBlocks[i - 1].y)
                redraw();


                database.ref("match2/players/player" + i).update({
                    request: ""
                });
            } //This will be called if a block move downwards is successful AND did not not the ground
            else {
                redraw();
                database.ref("match2/players/player" + i).update({
                    request: ""
                });
            } //Simply removes request if request is denied for any reason - likely only useful in edge cases, since when a player can't move a block down, this means it has hit bottom
        }
        if (snapshot.val().request == "1") {
            if (movingBlocks[i - 1].rotateBlockAlt(1)) {
                redraw();
                database.ref("match2/movingBlocks/" + (i)).update(blockToObject(movingBlocks[i - 1]));
            }
            database.ref("match2/players/player" + i).update({
                request: ""
            });
        }
        if (snapshot.val().request == "remove"){
            hostRemovePlayer(i);
        }

    }

}

function hostPlayerListener(snapshot){


    /*
    if(snapshot.val() > (playersInGame.length + 1)){ //+1 to inlcude host

        for(let i = 1; i < snapshot.val(); i++){
            if(!playersInGame.includes("player" + (i))){
                addColumn(10);
                database.ref("match2/players/player" + i).on("value", hostPlayerHandler);
                playersInGame.push("player" + i);
            }
        }

    }
    *///OLD code compatable only with non - removed players, since it is reliant of a player - number system
    if(!playersInGame.includes("player" + snapshot.val()) && snapshot.val() > 1) {
        addColumn(10);
        database.ref("match2/players/player" + (snapshot.val())).on("value", hostPlayerHandler);
        playersInGame.push("player" + (snapshot.val()));
        redraw();
    }


}

function move(event){

    if(inMotion) {

        /*
        if (event.keyCode == 70){
            movingBlocks[0] = Object.create(block);
            movingBlocks[0].x = 1;
            movingBlocks[0].y = 1;
            movingBlocks[0].squares[2][0] = Object.create(square);
            movingBlocks[0].squares[2][1] = Object.create(square);
            movingBlocks[0].squares[2][2] = Object.create(square);
            movingBlocks[0].squares[2][3] = Object.create(square);
            movingBlocks[0].squares[3][0] = Object.create(square);
            movingBlocks[0].squares[3][1] = Object.create(square);
            movingBlocks[0].squares[3][2] = Object.create(square);
            movingBlocks[0].squares[3][3] = Object.create(square);
            redraw();
        } //REMOVE THIS LATER
        */

        if (event.keyCode == 40) {

            if (host && movingBlocks[playerNumber - 1] != undefined) {

                let movedBlock = movingBlocks[playerNumber - 1].moveBlock("d");

                if (movedBlock == "touchingDead") {
                    
                    bottomedBlock(playerNumber, null);
                }

                else if (movedBlock == true) {
                    redraw();
                    database.ref("match2/movingBlocks/" + (playerNumber) + "/y").set(movingBlocks[playerNumber - 1].y);
                }

            }

            else{
                database.ref("match2/players/player" + playerNumber).update({
                    request: "d"
                });
            }

        } //D
        if (event.keyCode == 37) {
            if (host) {
                if (movingBlocks[playerNumber - 1].moveBlock("l")) {
                    let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
                    database.ref("match2/movingBlocks/" + (playerNumber)).update(updatedBlock)
                }
                ;
                redraw();
            } else {
                database.ref("match2/players/player" + playerNumber).update({
                    request: "l"
                });
            }

        } //L
        if (event.keyCode == 39) {
            if (host) {
                if (movingBlocks[playerNumber - 1].moveBlock("r")) {
                    let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
                    database.ref("match2/movingBlocks/" + (playerNumber)).update(updatedBlock)
                }
                ;
                redraw();
            } else {
                database.ref("match2/players/player" + playerNumber).update({
                    request: "r",
                });
            }

        } //R
        if (event.keyCode == 38) {
            if (host) {
                if (movingBlocks[playerNumber - 1].rotateBlockAlt(1)) {
                    let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
                    database.ref("match2/movingBlocks/" + playerNumber).update(updatedBlock)
                }
                ;
                redraw();
            } else {
                database.ref("match2/players/player" + playerNumber).update({
                    request: 1
                });
            }

        } //1


        if (event.keyCode == 78) { // TEMP KEYCODE - CREATED NEW BLOCK ON KEYPRESS, ONLY FOR TESTS
            if (host) {

                if (movingBlocks[playerNumber - 1] == undefined) {
                    let oldNumBlocks = 0;
                    database.ref("match2/numBlocks").once("value").then(function (snapshot) {
                        oldNumBlocks = snapshot.val();
                        database.ref("match2/numBlocks").set((oldNumBlocks + 1)); //here
                    })

                }

                movingBlocks[playerNumber - 1] = createBlock(blocks[currentBlock], 4, 1);
                redraw();
                if (currentBlock == blocks.length - 1) {
                    currentBlock = 0;
                } else {
                    currentBlock++;
                }
                let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
                updatedBlock["index"] = playerNumber
                database.ref("match2/movingBlocks/" + (playerNumber)).update(updatedBlock);
            } else {
                database.ref("match2/players/player" + playerNumber).update({
                    request: "n"
                });
            }


        } //N
    }

}

function bottomedBlock(i, oldCurrentBlock){ //index as in playerNumber
    if(createBlock("red", (((i - 1) * 10) + 4), 1) != null) {
        if(i == playerNumber){

            movingBlocks[playerNumber - 1] = createBlock(blocks[currentBlock], 4, 1);
            redraw();


            if (currentBlock == blocks.length - 1) {
                currentBlock = 0;
            } else {
                currentBlock++;
            }


            let updatedBlock = blockToObject(movingBlocks[playerNumber - 1]);
            updatedBlock["index"] = playerNumber
            database.ref("match2/movingBlocks/" + (playerNumber)).update(updatedBlock);
        }

        else{
            if(oldCurrentBlock == null){
                database.ref("match2/players/player" + i + "/currentBlock").once("value", function (snapshot) {
                    oldCurrentBlock = snapshot.val();

                    movingBlocks[i - 1] = createBlock(blocks[oldCurrentBlock], (((i - 1) * 10) + 4), 1);
                    redraw();
                    let newCurrentBlock = oldCurrentBlock;
                    if (oldCurrentBlock == blocks.length - 1) {
                        newCurrentBlock = 0;
                    } else {
                        newCurrentBlock++;
                    }
                    let updatedBlock = blockToObject(movingBlocks[i - 1]);

                    database.ref("match2/movingBlocks/" + (i)).update(updatedBlock); // (1+1) is due to the fact that firebase things are slid over 1, no 0 index :( so player number 1 is at movingBlocks index 2 in DB
                    database.ref("match2/players/player" + i).update({
                        currentBlock: newCurrentBlock,
                        request: ""
                    });
                })
            }
            else
                {
                    movingBlocks[i - 1] = createBlock(blocks[oldCurrentBlock], (((i - 1) * 10) + 4), 1);
                    redraw();
                    let newCurrentBlock = oldCurrentBlock;
                    if (oldCurrentBlock == blocks.length - 1) {
                        newCurrentBlock = 0;
                    } else {
                        newCurrentBlock++;
                    }
                    let updatedBlock = blockToObject(movingBlocks[i - 1]);

                    database.ref("match2/movingBlocks/" + (i)).update(updatedBlock); // (1+1) is due to the fact that firebase things are slid over 1, no 0 index :( so player number 1 is at movingBlocks index 2 in DB
                    database.ref("match2/players/player" + i).update({
                        currentBlock: newCurrentBlock,
                        request: ""
                    });
                }

        }
    }
}

//Firebase - specific translations from host data to firebase data
function objectToDead(snapshot){// where snapshot = match
    let modifiedGrid = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    let width = Number(Object.keys(snapshot.val()[1])[0]) + 1; //Using "0" system, this finds width of the grid
    for (row = 0; row < 20; row++) {
        for (column = 0; column < width - 1; column++) { // Because firebase hates 0, must use 1 since this is the first row of the array
            modifiedGrid[row][column] = null;
        }
    }
    if(snapshot.val() != null) {
        for (row = 1; row < 21; row++) {
            for (column = 1; column < width; column++) {
                if (snapshot.val()[row] != undefined && snapshot.val()[row][column] != undefined && snapshot.val()[row][column] != 0) {
                    let newSquare = Object.create(square);
                    newSquare.color = snapshot.val()[row][column].color;
                    newSquare.x = snapshot.val()[row][column].x;
                    newSquare.y = snapshot.val()[row][column].y;
                    modifiedGrid[row - 1][column - 1] = newSquare;
                } else {
                    modifiedGrid[row - 1][column - 1] = null;
                }
            }
        }
    }

    return Object.assign([],modifiedGrid);
}

function deadToObject(){
    let modifiedGrid = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

    for (row = 0; row < 20; row++) {
        for (column = 0; column < dead[0].length; column++) {
            modifiedGrid[row][column] = null;
        }
    }

    for (row = 0; row < 20; row++) {
        for (column = 0; column < dead[0].length; column++) {
            if (dead[row][column] != null) {
                modifiedGrid[row + 1][column + 1] = {
                    color: dead[row][column].color,
                    x: dead[row][column].x,
                    y: dead[row][column].y,
                };
            } else {
                modifiedGrid[row + 1][column + 1] = null;
            }
        }
    }

    if(modifiedGrid[1][dead[0].length] == null){
        modifiedGrid[1][dead[0].length] = 0; //This is needed so that users can detect how large the grid is, since grid size changes
    }

    let temp = []
    for (row = 0; row < 21; row++) {
        temp.push(Object.assign({}, modifiedGrid[row]));
    }
    return(Object.assign({}, temp));
}

function squaresToObject(squares){
    let modifiedGrid = [[null, null, null, null,null],
        [null, null, null, null,null],
        [null, null, null, null,null],
        [null, null, null, null,null],
        [null, null, null, null,null]];
    for (row = 0; row < 4; row++) {
        for (column = 0; column < 4; column++) {
            if (squares[row][column] != null) {
                modifiedGrid[row + 1][column + 1] = {
                    color: squares[row][column].color,
                    x: squares[row][column].x,
                    y: squares[row][column].y
                }
                ;
            } else {
                modifiedGrid[row + 1][column + 1] = 0;
            }
        }
    }

    let temp = []
    for (row = 0; row < 5; row++) {
        temp.push(Object.assign({}, modifiedGrid[row]));
    }
    return(Object.assign({}, temp));
}

function objectToSquares(squares){// where snapshot = movingBlocks[playerNumber - 1] FINISH THIS
    let modifiedSquares = [[null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]];
    for (row = 1; row < 5; row++) {
        for (column = 1; column < 5; column++) {
            if (squares[row][column] != 0) {
                let newSquare = Object.create(square);
                newSquare.color = squares[row][column].color;
                newSquare.x = squares[row][column].x;
                newSquare.y = squares[row][column].y;

                modifiedSquares[row - 1][column - 1] = newSquare;
            } else {
                modifiedSquares[row - 1][column - 1] = null;
            }
        }
    }

    return Object.assign([],modifiedSquares);
}

function objectToBlock(downloadBlock){
    let newBlock = Object.create(block);
    newBlock.color = downloadBlock.color,
        newBlock.x = downloadBlock.x,
        newBlock.y = downloadBlock.y,
        newBlock.direct = downloadBlock.direct,
        newBlock.squares = objectToSquares(downloadBlock.squares);
    return newBlock;
}

function blockToObject(inputBlock){
    if(inputBlock != null) {
        return {
            color: inputBlock.color,
            x: inputBlock.x,
            y: inputBlock.y,
            direct: inputBlock.direct,
            squares: squaresToObject(inputBlock.squares),
        }
    }
}


// PLEASE DELETE THIS WHEN DONE TESTING!!! Only used so that a user can be declared a host without creating a new match on their own
function makeHost(){
    host = true;
    playerNumber = 1;
    database.ref("match2/grid").off("value", clientGridHandler);
    database.ref("match2/movingBlocks").off("value", clientMovingBlocksHandler);
    database.ref("match2/numPlayers").on("value", hostPlayerListener);
    database.ref("match2/players").once("value", function(players) {
        database.ref("match2/movingBlocks").once("value", function (movingBlocksDB) {

            for (let player in players.val()){
                if (movingBlocksDB.val()[player.index] != undefined) {
                    movingBlocks[i - 1] = objectToBlock(movingBlocksDB.val()[i]);
                    //console.log (i);
                    database.ref("match2/players/player" + i).on("value", hostPlayerHandler); //Adds listener for each player
                }
            }

        })
    });
} //Yeah, this is broken now due to a different player system ( the count got shifted up 1 to match movingBlockDB ), because the orig host deletes grid
//when the leave, and because for some reason this system doesn't pick up on player's requests.

function hostRemovePlayer(playerToRemove){

    if(host && playersInGame.includes("player" + playerToRemove)){

        playersInGame.splice(playersInGame.indexOf("player" + playerToRemove), 1);

        if(movingBlocks[playerToRemove - 1] != null) {
            movingBlocks[playerToRemove - 1] = null;

            let updatedMovingBlockNum = 0;
            for(let i = 0; i < movingBlocks.length; i++){
                if(movingBlocks[i] != null){
                    updatedMovingBlockNum ++;
                }
            }
            database.ref("match2/numBlocks").set(updatedMovingBlockNum);

        }

        //removeColumn(10, playerToRemove);

        database.ref("match2/players/player" + playerToRemove).off("value", hostPlayerHandler);

        database.ref("match2/players/player" + playerToRemove).remove();

        database.ref("match2/movingBlocks/" + (playerToRemove)).remove();

        redraw();

    }

}

function clientRemovePlayer(playerToRemove){
    database.ref("match2/movingBlocks/" + playerToRemove).off("value", clientMovingBlocksHandler);
    movingBlocks[playerToRemove - 1] = null;
    playersInGame.splice(playersInGame.indexOf("player" + playerToRemove), 1);
    redraw();
}

function clearDead(){
    for (let row = 0; row < 20; row++){
        for (let column = 0; column < dead[0].length; column++){
            dead[row][column] = 0;
        }
    }
    database.ref("match2/grid").update(deadToObject())
}

function addColumn(numColumns){
    if(host){
        let oldWidth = dead[0].length;
        for(let row = 0; row < 20; row ++){
            for(let column = oldWidth; column < oldWidth + numColumns; column ++){
                dead[row][column] = null;
            }
        }
    }
    gridX = (window.innerWidth / 2) - ((dead[0].length / 2) * (blockSize + (blockSize / 6))); //dead[0].length / 2 = half of horiz. size
    gridY = (window.innerHeight / 2) - (10 * (blockSize + (blockSize / 6)));
    redraw();
    database.ref("match2/grid").update(deadToObject())
}

function removeColumn(numColumns, index){
    if(host){

        let oldWidth = dead[0].length
        sortPlayersInGame();
        let modifiedIndex = playersInGame.indexOf("player" + index);
        removeColumn(modifiedIndex + 1);

        for(let column = oldWidth - 1; column > (10 * index) + 9; column --) {
            for (let row = 0; row < 20; row++) {
                dead[row][column - numColumns] = dead[row][column];
            }
        }

        for(let row = 0; row < 20; row ++){
            for(let column = oldWidth - 1; column > (10 * index) - 1; column --){
                dead[row].length = oldWidth - numColumns;
            }
        }

        for(let i = 0; i < movingBlocks.length; i++){
            if(movingBlocks[i] != null && ((index * 10) + 10) < movingBlocks[i].x){
                movingBlocks[i].x -= numColumns;
                database.ref("match2/movingBlocks/" + i + "/x").set(movingBlocks[i].x)
            }

        }

        gridX = (window.innerWidth / 2) - ((dead[0].length / 2) * (blockSize + (blockSize / 6))); //dead[0].length / 2 = half of horiz. size
        gridY = (window.innerHeight / 2) - (10 * (blockSize + (blockSize / 6)));
        redraw();
        database.ref("match2/grid").update(deadToObject())
    }

}

function clearGrid(){
    for(let row = 0; row < 20; row++){
        for(let column = 0; column < dead[0].length; column++){
            dead[row][column] = null;
        }
    }
    redraw();
    database.ref("match2/grid").update(deadToObject())
}

function sortPlayersInGame(){
    let modifiedPlayersInGame = [playersInGame[0]]
    for(let i = 1; i < playersInGame.length; i++){
        let placed = false;
        for(let j = 0; j < modifiedPlayersInGame.length; j++){

            if(!placed && Number(playersInGame[i].substring(6, playersInGame[i].length)) < Number(modifiedPlayersInGame[j].substring(6, modifiedPlayersInGame[j].length))){
                modifiedPlayersInGame.splice(j, 0, playersInGame[i]);
                placed = true;
                //console.log(j);
            }

        }
        if(!placed){
            modifiedPlayersInGame[modifiedPlayersInGame.length] = playersInGame[i];
        }
    }
    return modifiedPlayersInGame;
}

/* TODO

- Add auth and different rooms
- Add individual scores for each player
DONE - Add method to remove players from game, and remove event listeners from each client

- Make the grid size decrease when players are booted - removeColumn has the groundwork for this, but since position is based on (playerNumber - 1) * 10, deleting players messes this up.
Will have to create new system for spawning blocks

- Add the super cool block detection into moveBlock and rotateBlockAlt
    * Make a copy of dead ( a REAL deep copy ) except it's just booleans for if each spot contains a square, either from dead or from other movingBlocks
    * Just realized this changes the fundamentals of those methods
        - Suffer
    *


DONE - Make detection for when game is over

DONE - Make the dead width dynamic

DONE - Make the number of players dynamic, as well as the event listener for each that is created by the host
            * No cap on simultaneous users, however, may want to add cap later on just so matches aren't super big or laggy

 */



/* IDEAS
- Shift the whole dead system down and over 1 so it lines up with the firebase grid
    * Probably kinda dumb because a conversion still would have to take place to get the array to an object

- index is only added once to a block when it is added to the Firebase DB for the first time - every time a person sends a request, the host copies the block, modifies it, and sends it back.
This may cause issues if the client or host has to put a new block in the DB.

- Powerups:
    * Make other player's screen super small
    * Ink other person's screen
    * Other player's speed increases
    * Other player gets large block
    *

- Ping idea
    * Each player has ping calculated, host gets their refresh delayed by the average ping

- Cheapskate idea
    * Every time I run out of firebase data, have a bot that automatically creates a new google account and firebase
 */



/*LOG

4/5 - Added multiple player compatibility. To do this, I added an index to each player so that the host can have an event handler for each individual player.
Also added numPlayers under match2/ in the DB. Each player now adds themself to the DB dynamically. Added playersAdded array so host can keep
track of each user they've added, and adds a listener for each player based on if they're on the array yet or not.

Need to make cadence apply to all players still.

4/7 - Added more efficient event handler for each player listening to movingBlocks. Clients now keep track of each player whose block they track,
and add an event handler for it whenever they create a block. Really a pain, I had to add an index to movingBlocks in the DB that matches a player's index.
Index is added whenever host adds block, so no worries about it disappearing.

4/9 - Fixed issue where clientPlayerListener would add a listener for whichever player was first in the list of players, and not whichever players actually had a block. Also fixed
makeHost(), since it was setting the wrong event handlers up. STARTED working on synced cadence.

4/14 - EXCITING - Finally started making grid width dynamic. Things seem to work great on host. Now, need to add extended grid capabilities to clients. Not exciting - amp left channel just went rip.

4/16 - Made some changes to how moving blocks are updated - instead of updating entire block, only the x or y is set based on movement of block. Hopefully more efficient. Client now adjusts
gridX so it's centered when the size changes. Grid size auto adds 10 spaces per each new player. LAG CITY for some reason, despite best efforts to make code efficient. Fixed cadence so it actually
adds a new block for clients when theirs reaches the ground.

- Later on, added yellow glow around player's block. Plus, fixed bug in client objectToGrid where last column wasn't being displayed.

4/20 - Started adding in gameOver detection. Ran into bugs when tried to make it so new block could not be created if in a spot that is full. May just let block be created to avoid having to
add compatibility to a null movingBlock.

4/22 - Fixed gameOver bugs - I test if we can make a block where we plan to make one, and if we can't, we know it's gameOver. This fixed gameOver bugs in a way that didn't add much code, but took a long while. Need to add rooms
to game as well and especially auth, since that's a project requirement. In two weeks week pavan and I plan on putting the back and front end together and we'll see what happens.

4/26 - Started to add removePlayer compatibility. Found success in deleting columns and likely event handlers. Realized that when a player is removed, this may cause an issue with playerNumber system.
For example, with the spawning of blocks, the x position of a new block is based on the playerNumber. May have to make this system based on the position of a player relative to others in movingBlocks.
Deleting columns is still broken, but getting there. START NEXT TIME WITH THAT. I NEED TO MAKE THE LOOPING STRUCTURE SHIFT OVER EACH COLUMN LEFT OF THE PLAYER SECTION WE WANT TO DELETE SO THAT THE PLAYER TO
BE DELETED's COLUMNS ARE COVERED BY OTHER PLAYER's COLUMNS. THEN DELETE EXTRA COLUMNS AT END OF GRID.

4/28 - Almost finished removePlayer. Some errors are still there for clients, I think their playerNumber is one off from the number they think they are in playersInGame.


5/9 - Added ability to change account info. Just started thinking about creating and joining rooms, and the place to start is the function joinRoom. Must make a folder in the firebase DB
for all room codes, and add event so when host leaves the room code is removed from this folder. When joining room, clients check this folder to see if their room code exists in it.

5/10 - Added capability for clients to detect when the game is over, either by host leaving or regularly. Added score updates and client listener for score change. (Untested)
 */