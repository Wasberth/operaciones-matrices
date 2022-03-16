// LIBRARIES
const express = require('express');
const app = express();
const server = require('http').Server(app);
const math = require('mathjs');

// OTHER JS FILES
const matrixHandler = require('./matrix-handler');
const solver = require('./solver');

// ENCODERS & MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

// PORT FOR LISTENING
const port = process.env.PORT || 3000; // FOR HEROKU
//const port = 25565; // FOR TESTING

// FROM POST METHOD CALCULATE
app.post('/calculate1', (req, res) => {
    console.log(req.body);
    let a = matrixHandler.CreateIfValid(req.body, 'a');
    let a2 = matrixHandler.matrixDot(a, a);

    let _a = matrixHandler.createMatrixControl(a.mc.nRow, a.mc.nCol, a.mc.matrix);
    solver.diagonalize(_a, false);
    let _aD = _a.calculateDet();

    let _a2 = matrixHandler.createMatrixControl(a2.mc.nRow, a2.mc.nCol, a2.mc.matrix);
    solver.diagonalize(_a2, false);
    let _a2D = _a2.calculateDet();

    let am = a.getM();
    for (let i = 0; i < am.mc.nRow; i++) {
        am.multiplyRow(i, math.divide(1, _aD.d));
    }

    /*console.log(a);
    console.log(a.mc);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            console.log(math.format(a.mc.matrix[i][j]));
        }
    }
    b = matrixHandler.matrixDot(a, a);
    console.log(b);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            console.log(math.format(b.mc.matrix[i][j]));
        }
    }

    let f = math.fraction('-30/9');
    console.log(f);
    console.log(f.n);
    console.log(f.d);
    console.log(b.mc.matrix);
    b.shiftRows(0, 1);
    console.log(b.mc.matrix);

    solver.diagonalize(a, true);
    console.log("after diag");
    console.log(a.mc.matrix);
    console.log(a.getOriginalHtml());
    console.log(a.getHtml());
    console.log(a.balances);*/

    res.send(`<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

    <link rel="stylesheet" href="css/matrix.css">

    <title>Document</title>
</head>

<body>

    <style>
        .separate {
            margin-bottom: 5px;
        }
    </style>

    <div class="container" style="margin-top: 1rem;">

        <div class="row">
            <h2>Operaciones con matrices</h2>

            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptates nostrum distinctio, recusandae aliquam sed cumque! Consectetur, debitis? Obcaecati, ad minus accusantium totam, veniam, voluptatibus alias voluptate nulla eos temporibus
                blanditiis.
            </p>
        </div>

        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">A = </div>
            ${a.getOriginalHtml()}

        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">|A|: </div>
            ${_a.getOriginalHtml()}
            ${_a.getHtml()}
            <div class="col" style="text-align: center; margin-top: 1rem;">|A| = ${_aD.op} = ${_aD.det}</div>
        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">A<sup>2</sup>&nbsp;=&nbsp;</div>
            ${a2.getOriginalHtml()}

        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">|A<sup>2</sup>|: </div>
            ${_a2.getOriginalHtml()}
            ${_a2.getHtml()}
            <div class="col" style="text-align: center; margin-top: 1rem;">|A<sup>2</sup>| = ${_a2D.op} = ${_a2D.det}</div>
        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">M<sup>T</sup> = </div>
            ${am.getOriginalHtml()}
            <div class="col" style="text-align: center; margin-top: 1rem;">A<sup>-1</sup> = </div>
            ${am.getMatrixHtml()}
        </div>

    </div>
</body>

</html>
    `);
});


// SERVER STARTUP
server.listen(port, function() {
    console.log(`Servidor corriendo en el puerto ${port}`);
});