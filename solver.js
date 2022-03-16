const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all, {
    number: 'Fraction'
});

function diagonalize(m, up) {
    console.log("lala");

    for (let ec = 0; ec < m.mc.nRow - 1; ec++) {
        console.log("for");
        pivot = chooseRow(m, ec);

        if (pivot === -1) { continue; }

        if (pivot !== ec) { m.shiftRows(ec, pivot); }

        for (let affEc = ec + 1; affEc < m.mc.nRow; affEc++) {
            if (math.equal(m.mc.matrix[ec][ec], 0) || math.equal(m.mc.matrix[affEc][ec], 0)) { continue; }
            let affEcCoeff = m.mc.matrix[ec][ec];
            let ecCoeff = m.mc.matrix[affEc][ec];

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        //m.simplify();
    }

    let range = m.calculateStatus();

    console.log(`RANGE = ${range}`);

    if (!up || range !== m.mc.nRow) {
        console.log(`Returning ${!up}, ${range}, ${m.mc.nRow}`);
        return;
    }

    for (let ec = m.mc.nRow - 1; ec >= 1; ec--) {

        for (let affEc = ec - 1; affEc >= 0; affEc--) {
            if (math.equal(m.mc.matrix[ec][ec], 0) || math.equal(m.mc.matrix[affEc][ec], 0)) { continue; }
            let affEcCoeff = m.mc.matrix[ec][ec];
            let ecCoeff = m.mc.matrix[affEc][ec];

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        //m.simplify();
    }
}

function chooseRow(m, index) {
    let row = -1;
    let prev = undefined;
    for (let i = index; i < m.mc.nRow; i++) {
        console.log(`Matrix: ${m.mc.matrix}`);
        console.log(`Comparing: ${m.mc.matrix[i][index]}, ${i}, ${index}`);
        if (math.equal(m.mc.matrix[i][index], 0)) { continue; }

        if (typeof prev === 'undefined') {
            prev = m.mc.matrix[i][index];
            row = i;
            break;
        }

        let sm = math.smaller(math.abs(m.mc.matrix[i][index]), math.abs(prev));

        if (!math.equal(sm, prev)) {
            prev = m.mc.matrix[i][index];
            row = i;
        }

    }

    console.log(row);

    return row;
}

module.exports.diagonalize = diagonalize;