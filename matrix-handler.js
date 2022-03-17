const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all, {
    number: 'Fraction'
});

const solver = require('./solver');

function formatFraction(frac) {
    return `${frac.s == 1? "" : "-&nbsp;"}${frac.n}${math.equal(math.abs(frac.d), 1)? "": `&frasl;${math.abs(frac.d)}`}`;
}

function shiftRows(mc, row1, row2) {
    console.log(`Shifting rows, ${row1}, ${row2}`);

    for (let i = 0; i < mc.nCol; i++) {
        let temp = math.fraction(mc.matrix[row1][i]);
        mc.matrix[row1][i] = math.fraction(mc.matrix[row2][i]);
        mc.matrix[row2][i] = math.fraction(temp);
    }
}

function subtractRows(mc, affRow, affRowCoeff, subRow, subRowCoeff) {
    for (let i = 0; i < mc.nCol; i++) {
        mc.matrix[affRow][i] = math.subtract(
            math.multiply(affRowCoeff, mc.matrix[affRow][i]),
            math.multiply(subRowCoeff, mc.matrix[subRow][i])
        );
    }
}

function multiplyRow(mc, row, coeff) {
    console.log(mc.matrix);
    console.log(`Multiply, ${row}, ${coeff}`);
    for (let i = 0; i < mc.nCol; i++) {
        mc.matrix[row][i] = math.multiply(coeff, mc.matrix[row][i]);
    }
}

function matrixDot(A, B) {
    try {
        if (!A || !B || A.mc.matrix.length === undefined || B.mc.matrix[0].length === undefined || A.mc.matrix.length !== B.mc.matrix[0].length) {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }

    var result = new Array(A.mc.matrix.length).fill(0).map(() => new Array(B.mc.matrix[0].length).fill(0));

    return createMc(A.mc.matrix.length, B.mc.matrix[0].length,
        result.map((row, i) => {
            return row.map((val, j) => {
                return A.mc.matrix[i].reduce((sum, elm, k) => math.add(sum, math.multiply(elm, B.mc.matrix[k][j])), 0);
            });
        }));
}

function validateJSON(json, mN) {
    console.log(json);
    let nRow = json[`n-rows-${mN}`]; // Number of ecuations
    let nCol = json[`n-cols-${mN}`]; // Number of variables

    if (typeof nRow === 'undefined' || typeof nCol === 'undefined' ||
        isNaN(nRow) || isNaN(nCol)) { // IF N-ROWS & N-COLS IS VALID NUMBER
        return { isCorrect: false };
    }
    nRow = Number(nRow);
    nCol = Number(nCol);

    let matrix = Array(nRow).fill().map(() => Array(nCol).fill()); // INIT ARRAY WITH undefined

    for (let i = 0; i < nRow; i++) {
        for (let j = 0; j < nCol; j++) {

            let currentVar = json[`${mN}-${i}-${j}`];
            /*if (typeof currentVar === 'undefined' || isNaN(currentVar)) { // IF j-i VAR IS VALID NUMBER
                return { isCorrect: false };
            };*/

            try {
                matrix[i][j] = math.fraction(currentVar);
            } catch (error) {
                matrix[i][j] = math.fraction(0);
            }
        }
    }

    return createMc(nRow, nCol, matrix);
}

function createMc(nRow, nCol, matrix) {
    let ogMatrix = Array(nRow).fill().map(() => Array(nCol).fill());
    let cMatrix = Array(nRow).fill().map(() => Array(nCol).fill());

    for (let i = 0; i < nRow; i++) {
        for (let j = 0; j < nCol; j++) {
            ogMatrix[i][j] = math.fraction(matrix[i][j]);
            cMatrix[i][j] = math.fraction(matrix[i][j]);
        }
    }
    return {
        isCorrect: true,
        mc: { nRow: nRow, nCol: nCol, matrix: cMatrix },
        ogMatrix: ogMatrix,
        balances: [], // Factors to get same det value after operation

        shiftRows: function(rowA, rowB) {
            this.balances.push(math.fraction(-1));
            //this.appendStep();
            shiftRows(this.mc, rowA, rowB);
            this.addT(`F<sub>${rowA + 1}</sub>&nbsp;&harr;&nbsp;F<sub>${rowB + 1}</sub><br>`);
            this.appendStep();
        },
        subtractRows: function(affRow, affRowCoeff, subRow, subRowCoeff) {
            //this.appendStep();
            subtractRows(this.mc, affRow, affRowCoeff, subRow, subRowCoeff);
            this.balances.push(math.divide(1, affRowCoeff));

            this.addT(`${math.equal(affRowCoeff, 1)? "": formatFraction(affRowCoeff)}F<sub>${affRow + 1}</sub>` +
                `&nbsp;${math.smaller(subRowCoeff, 0) ? "+":"-"}&nbsp;` +
                `${math.equal(math.abs(subRowCoeff), 1)? "" : formatFraction(math.abs(subRowCoeff))}F<sub>${subRow + 1}</sub>` +
                `&nbsp;&rarr;&nbsp;F<sub>${affRow + 1}</sub><br>`);
        },
        multiplyRow: function(row, coeff) {
            //this.appendStep();
            multiplyRow(this.mc, row, coeff);
            this.balances.push(math.divide(1, coeff));

            this.addT(`${formatFraction(coeff)}F<sub>${row + 1}</sub>&nbsp;&rarr;&nbsp;F<sub>${row + 1}</sub><br>`);
        },
        simplify: function() {
            //let appended = false;
            for (let ec = 0; ec < this.mc.nRow; ec++) {
                let cGcd = this.mc.matrix[ec][0];

                for (let i = 1; i < this.mc.nCol; i++) {
                    cGcd = math.gcd(cGcd, this.mc.matrix[ec][i]);
                }

                /*if (typeof cGcd === 'undefined' || cGcd === 0) {
                    this.addT(`Se borró la F<sub>${ec + 1}</sub><br>`);

                    this.mc.matrix.splice(ec, 1);
                    this.mc.nRow--;
                    ec--;

                    this.appendStep();
                    continue;
                }*/

                cGcd = math.abs(cGcd);

                if (cGcd === 1) continue;

                this.multiplyRow(i, cGcd);
            }
            this.appendStepValidate();
        },
        calculateStatus: function() {
            let rangeMatrix = 0;
            for (let i = 0; i < this.mc.nRow; i++) {
                let matIsCero = false;

                for (let j = 0; j < this.mc.nCol && !matIsCero; j++) {
                    matIsCero = this.mc.matrix[i][j] !== 0;
                }

                if (matIsCero) { rangeMatrix++; }
            }

            return rangeMatrix;

            /*if (rangeMatrix !== rangeAumMatrix) {
                this.addT(`Calculando el rango:<br> R(M) = ${rangeMatrix} &ne; R(M*) = ${rangeAumMatrix}`);
                this.appendT(false);
                return 0; // NO SOLUTIONS
            }
            if (rangeMatrix === rangeAumMatrix && rangeAumMatrix < this.mc.nCol) {
                this.addT(`Calculando el rango:<br> R(M) = R(M*) = ${rangeMatrix} < #inc = ${this.mc.nCol}`);
                this.appendStep(false);
                return 1; // INFINITAS SOLUCIONEs
            }
            this.addT(`Calculando el rango:<br> R(M) = R(M*) = #inc = ${rangeMatrix}`);
            this.appendStep(false);
            return 2; // UNA SOLA SOLUCION*/
        },
        calculateDet: function() {
            let op = "<strong>";
            let det = math.fraction(1);

            this.balances.forEach(b => {
                if (!math.equal(1, b)) {
                    op = op + `(${formatFraction(b)})`;
                    det = math.multiply(det, b);   
                }
            });

            op = op + "</strong>";

            for (let i = 0; i < this.mc.nRow; i++) {
                op = op + `(${formatFraction(this.mc.matrix[i][i])})`;
                det = math.multiply(det, this.mc.matrix[i][i]);
            }

            return {op: op, det: formatFraction(det), d: det};
        },
        getM: function(){
            console.log("GET M");
            console.log(this.mc.matrix);
            let M = Array(nRow).fill().map(() => Array(nCol).fill());

            for (let i = 0; i < this.mc.nRow; i++) {
                for (let j = 0; j < this.mc.nCol; j++) {
                    
                    let T = [];
                    for (let i2 = 0; i2 < this.mc.nRow; i2++) {
                        if (i2 === i) { continue; }
                        let T2 = [];
                        for (let j2 = 0; j2 < this.mc.nCol; j2++) {
                            if (j2 === j) { continue; }
                            T2.push(this.mc.matrix[i2][j2]);
                        }
                        T.push(T2);
                    }

                    console.log("T");
                    console.log(T);

                    let TC = createMc(this.mc.nRow - 1, this.mc.nCol - 1, T);
                    console.log(TC.mc.matrix);
                    solver.diagonalize(TC, false);
                    console.log(TC.mc.matrix);

                    let d = TC.calculateDet().d;
                    console.log(d);
                    let s = math.pow(-1, i + j);
                    console.log(s);

                    M[j][i] = math.multiply(d, s);
                }
            }

            console.log("=================================");

            let MC = createMc(this.mc.nRow, this.mc.nCol, M);

            console.log(MC);

            return MC;
        },

        steps: "",
        appendedHtml: "",

        addT: function(t) { // For step descriptions
            this.steps = this.steps + t;
        },
        appendT: function(appendArrow = true) { // For HTML step descriptions (and clears steps)
            if (this.steps === "") { return; }

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="text-align: center; margin-top: 1rem;">` + this.steps +
                `${appendArrow? "&rarr;":""}</div>`;
            this.steps = "";
        },
        appendStep: function(appendArrow = true) { // For HTML step and step descriptions
            this.appendT(appendArrow);

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nRow; i++) {

                this.appendedHtml = this.appendedHtml +
                    `<tr>`;

                for (let j = 0; j < this.mc.nCol; j++) {
                    this.appendedHtml = this.appendedHtml +
                        `<td style="padding-left:5px; padding-right:5px">${formatFraction(this.mc.matrix[i][j])}</td>`;
                }

                this.appendedHtml = this.appendedHtml +
                    `</tr>`;
            }

            this.appendedHtml = this.appendedHtml +
                `       </tbody>` +
                `   </table>` +
                `</div>`;
        },
        appendStepValidate: function() { // Validates details to append step
            if (this.t === "") { return; }
            this.appendStep();
        },
        getHtml: function() {
            return this.appendedHtml;
        },
        getOriginalHtml: function() {
            let og =
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nRow; i++) {

                og = og + `<tr>`;

                for (let j = 0; j < this.mc.nCol; j++) {
                    og = og + `<td style="padding-left:5px; padding-right:5px">${formatFraction(this.ogMatrix[i][j])}</td>`;
                }

                og = og + `</tr>`;
            }

            og = og +
                `       </tbody>` +
                `   </table>` +
                `</div>`;

            return(og);
        },
        getMatrixHtml: function(){
            let m =
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nRow; i++) {

                m = m + `<tr>`;

                for (let j = 0; j < this.mc.nCol; j++) {
                    m = m + `<td style="padding-left:5px; padding-right:5px">${formatFraction(this.mc.matrix[i][j])}</td>`;
                }

                m = m + `</tr>`;
            }

            m = m +
                `       </tbody>` +
                `   </table>` +
                `</div>`;

            return(m);
        }
    };
}

module.exports.CreateIfValid = validateJSON;
module.exports.matrixDot = matrixDot;
module.exports.createMatrixControl = createMc;
module.exports.formatFraction = formatFraction;