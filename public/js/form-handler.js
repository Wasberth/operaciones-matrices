function editForm(mN) {
    console.log(mN);

    let rows = document.getElementById(`form-rows-${mN}`).value; // NUMBER OF ROWS

    let fC = document.getElementById(`form-cols-${mN}`);

    let cols = fC ? document.getElementById(`form-cols-${mN}`).value : rows; // NUMBER OF COLS


    // FORM FOR SYSTEM INPUT
    let html = `<input name="n-rows-${mN}" type="hidden" value="${rows}">` + // HIDDEN N-ROWS & N-COLS
        `<input name="n-cols-${mN}" type="hidden" value="${cols}">` +
        `<table style="width:100%;"><tbody>`;

    for (let i = 0; i < rows; i++) {
        html = html + `<tr class="form-group form-inline" style="width:100%;">`;
        for (let j = 0; j < cols; j++) {

            html = html +
                `<td><input name="${mN}-${i}-${j}" type="text" class="form-control flex-fill" value="0"></td>`; // INPUT FOR j i
        }
        html = html + `</tr>`;
    }

    html = html + "</table></tbody>";
    document.getElementById(`m-${mN}-container`).innerHTML = html; //APPEND

    return false;
};

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('form-control-a').onsubmit = function() { return editForm('a') };

    let b = document.getElementById('form-control-b');
    if (b) {
        b.onsubmit = function() { return editForm('b') };
    }
});