//Verifica ce taste sunt apasate si updateaza cand se apasa si cand este ridicata tasta
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

//Functie care verifica daca o tasta esta apasata
export function isKeyDown(key) {
    return keys[key];
}