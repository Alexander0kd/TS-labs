"use strict";
console.info("Інструкції із використання:");
console.info("Використання: triangle(value1, type1, value2, type2)");
console.info("Допустимі типи: 'leg', 'hypotenuse', 'adjacent angle', 'opposite angle', 'angle'");
console.info("Приклади:");
console.info("triangle(4, 'leg', 8, 'hypotenuse')");
console.info("triangle(8, 'hypotenuse', 4, 'leg')");
function triangle(val1, type1, val2, type2) {
    const validTypes = ['leg', 'hypotenuse', 'adjacent angle', 'opposite angle', 'angle'];
    const angleTypes = ['adjacent angle', 'opposite angle', 'angle'];
    // Type Validation
    if (!validTypes.includes(type1) || !validTypes.includes(type2)) {
        console.error("Не правильний тип. Дивіться інструкції!.");
        return "failed";
    }
    if ((type1 === 'angle' && type2 !== 'hypotenuse') || (type2 === 'angle' && type1 !== 'hypotenuse')) {
        console.log("Тип 'angle' повинен бути заданий в парі з 'hypotenuse'.");
        return "failed";
    }
    if (type1 === 'hypotenuse' && type2 === 'hypotenuse') {
        console.error("Неможливо вказати два значення гіпотенузи.");
        return "failed";
    }
    if (angleTypes.includes(type1) && angleTypes.includes(type2)) {
        console.error("Неправильна комбінація. Вказано два кути.");
        return "failed";
    }
    // Value Validations
    const value1 = Number(val1);
    const value2 = Number(val2);
    if (isNaN(value1) || isNaN(value2) || value1 <= 0 || value2 <= 0) {
        console.error("Значення повинні бути додатніми числами.");
        return "failed";
    }
    const checkAngle = (type, value) => {
        if (angleTypes.includes(type) && (value <= 0 || value >= 90)) {
            console.error("Кути повинні бути від 0 до 90 градусів.");
            return false;
        }
        return true;
    };
    if (!checkAngle(type1, value1) || !checkAngle(type2, value2)) {
        return "failed";
    }
    if ((type1 === 'hypotenuse' && type2 === 'leg') || (type2 === 'hypotenuse' && type1 === 'leg')) {
        const hypotenuse = type1 === 'hypotenuse' ? value1 : value2;
        const leg = type1 === 'leg' ? value1 : value2;
        if (hypotenuse <= leg) {
            console.error("Гіпотенуза повинна бути довшою за катет.");
            return "failed";
        }
    }
    // Calculation
    let a;
    let b;
    let c;
    let alpha;
    let beta;
    const processType = (type, value) => {
        switch (type) {
            case 'leg':
                if (a === undefined)
                    a = value;
                else
                    b = value;
                break;
            case 'hypotenuse':
                c = value;
                break;
            case 'adjacent angle':
                alpha = value;
                break;
            case 'opposite angle':
                beta = value;
                break;
            case 'angle':
                alpha = value;
                break;
        }
    };
    processType(type1, value1);
    processType(type2, value2);
    try {
        if (a !== undefined && b !== undefined) { // Два катети
            c = Math.sqrt(a ** 2 + b ** 2);
            alpha = Math.atan(a / b) * 180 / Math.PI;
            beta = 90 - alpha;
        }
        else if (a !== undefined && c !== undefined) { // Катет і гіпотенуза
            b = Math.sqrt(c ** 2 - a ** 2);
            alpha = Math.atan(a / b) * 180 / Math.PI;
            beta = 90 - alpha;
        }
        else if (a !== undefined && alpha !== undefined) { // Катет і прилеглий кут (a, A)
            c = a / Math.cos(alpha * Math.PI / 180);
            b = Math.sqrt(c ** 2 - a ** 2);
            beta = 90 - alpha;
        }
        else if (a !== undefined && beta !== undefined) { // Катет і протилежний кут (a, B)
            c = a / Math.sin(beta * Math.PI / 180);
            b = Math.sqrt(c ** 2 - a ** 2);
            alpha = 90 - beta;
        }
        else if (c !== undefined && alpha !== undefined) { // Гіпотенуза і кут/прилеглий кут (c, A)
            b = c * Math.sin(alpha * Math.PI / 180);
            a = Math.sqrt(c ** 2 - b ** 2);
            beta = 90 - alpha;
        }
        else if (c !== undefined && beta !== undefined) { // Гіпотенуза і протилежний кут (c, B)
            a = c * Math.sin(beta * Math.PI / 180);
            b = Math.sqrt(c ** 2 - a ** 2);
            alpha = 90 - beta;
        }
        else if (alpha !== undefined && beta !== undefined) { // Два кута (A, B)
            throw new Error("Введено два кути.");
        }
        else {
            throw new Error("Неправильна комбінація типів.");
        }
        if ((a !== undefined && a <= 0) ||
            (b !== undefined && b <= 0) ||
            (c !== undefined && c <= 0) ||
            (alpha !== undefined && (alpha <= 0 || alpha >= 90)) ||
            (beta !== undefined && (beta <= 0 || beta >= 90))) {
            throw new Error("Не коректно введені значення. \n І ні, 5.729577951308233e-18 не прокатить");
        }
        console.log(`a = ${a}`);
        console.log(`b = ${b}`);
        console.log(`c = ${c}`);
        console.log(`alpha = ${alpha}°`);
        console.log(`beta = ${beta}°`);
        return "success";
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : "Помилка при розрахунках");
        return "failed";
    }
}
