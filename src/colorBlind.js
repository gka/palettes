/* globals blinder */
import chroma from "chroma-js";

export function colorBlindCheck(colors) {
    const types = ["deuteranopia", "protanopia", "tritanopia"];
    const invalid = [];
    for (let i = 0; i < types.length; i++) {
        if (!checkType(colors, types[i])) invalid.push(types[i]);
    }
    return invalid;
}

export function colorBlindSim(color, type) {
    return blinder[type](chroma(color).hex());
}

function checkType(colors, type) {
    let ok = 0;
    let notok = 0;
    let ratioThreshold = 5;
    let smallestPerceivableDistance = 9;
    let k = colors.length;
    if (!k) {
        // console.log('no colors', type);
        return true;
    }
    // compute distances between colors
    for (let a = 0; a < k; a++) {
        for (let b = a + 1; b < k; b++) {
            let colorA = chroma(colors[a]);
            let colorB = chroma(colors[b]);
            let distanceNorm = difference(colorA, colorB);
            if (distanceNorm < smallestPerceivableDistance) continue;
            let aSim = blinder[type](colorA.hex());
            let bSim = blinder[type](colorB.hex());
            let distanceSim = difference(aSim, bSim);
            let isNotOk =
                distanceNorm / distanceSim > ratioThreshold &&
                distanceSim < smallestPerceivableDistance;
            if (isNotOk) {
                // console.log(type, colors[a],colors[b],aSim+'',bSim+'', distanceNorm, distanceSim, distanceNorm/distanceSim);
            }
            // count combinations that are problematic
            if (isNotOk) notok++;
            else ok++;
        }
    }
    // console.log(type, notok/(ok+notok));
    // compute share of problematic colorss
    if (notok > 0) console.log(type, notok, ok);
    return notok === 0;
}

function difference(colorA, colorB) {
    return (
        0.5 * (chroma.deltaE(colorA, colorB) + chroma.deltaE(colorB, colorA))
    );
}
