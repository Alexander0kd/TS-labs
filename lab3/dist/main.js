"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Ajax
const ajax = (() => {
    function GET(url, isFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                if (isFile) {
                    return (yield response.text());
                }
                return (yield response.json());
            }
            catch (error) {
                handleError(error, 'From [GET] function:');
            }
        });
    }
    function ngFor(template, count, data) {
        let response = '';
        for (let i = 0; i < count; i++) {
            let pageClone = template;
            if (data && data[i]) {
                pageClone = interpolate(pageClone, data[i]);
            }
            response += `${pageClone}\n`;
        }
        return response;
    }
    function interpolate(template, data) {
        return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
            var _a;
            return String((_a = data[key.trim()]) !== null && _a !== void 0 ? _a : '');
        });
    }
    function handleError(error, mesage) {
        // eslint-disable-next-line no-console
        console.error(mesage, error);
    }
    return {
        GET: GET,
        ngFor: ngFor,
        interpolate: interpolate,
    };
})();
let MAIN_DIV = null;
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8080'
    : 'https://raw.githubusercontent.com/Alexander0kd/TS-labs/main/lab3/dist';
// ! ==== !
// ! Home !
// ! ==== !
function loadHome() {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield ajax.GET(`${BASE_URL}/components/home.html`, true);
        if (!MAIN_DIV || !page)
            return;
        MAIN_DIV.innerHTML = page;
        const randomButton = document.getElementById('btn-random');
        randomButton === null || randomButton === void 0 ? void 0 : randomButton.addEventListener('click', loadRandom);
    });
}
function bindHeaderButtons() {
    const home = document.getElementById('btn-home');
    home === null || home === void 0 ? void 0 : home.addEventListener('click', loadHome);
    const categories = document.getElementById('btn-catalog');
    categories === null || categories === void 0 ? void 0 : categories.addEventListener('click', loadCategories);
}
function loadRandom() {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = yield ajax.GET(`${BASE_URL}/data/categories/response.json`, false);
        if (!categories)
            return;
        loadCategoriesGroup(Math.floor(Math.random() * categories.length));
    });
}
// ! ========== !
// ! Categories !
// ! ========== !
function loadCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield ajax.GET(`${BASE_URL}/components/catalog.html`, true);
        const categories = yield ajax.GET(`${BASE_URL}/data/categories/response.json`, false);
        if (!page || !categories)
            return;
        const interpolatedPage = ajax.ngFor(page, categories.length, categories);
        if (!MAIN_DIV)
            return;
        MAIN_DIV.innerHTML = `
        <div class="catalog-wrapper">
            <h2>Каталог</h2>
            <div class="catalog-items">
                    ${interpolatedPage}
            </div>
        </div>
    `;
        const buttons = document.getElementsByClassName('catalog-name');
        Array.from(buttons).forEach((btn, index) => {
            btn.addEventListener('click', () => loadCategoriesGroup(categories[index].id));
        });
    });
}
function loadCategoriesGroup(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield ajax.GET(`${BASE_URL}/components/group.html`, true);
        const categories = yield ajax.GET(`${BASE_URL}/data/categories/response.json`, false);
        if (!page || !categories)
            return;
        const group = categories.find((cat) => cat.id === categoryId);
        if (!group)
            return;
        const data = yield ajax.GET(`${BASE_URL}/data/items/${group.shortName}.json`, false);
        if (!data)
            return;
        const interpolatedData = ajax.ngFor(page, data.length, data);
        if (!MAIN_DIV)
            return;
        MAIN_DIV.innerHTML = `
        <div class="catalog-wrapper">
            <h2>${group.name}</h2>
            <div class="catalog-items">
                ${interpolatedData}
            </div>
        </div>
    `;
        const buttons = document.getElementsByClassName('group-name');
        Array.from(buttons).forEach((btn, index) => {
            btn.addEventListener('click', () => loadItem(group.id, index));
        });
    });
}
// ! ==== !
// ! Item !
// ! ==== !
function loadItem(categoryId, itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield ajax.GET(`${BASE_URL}/components/item.html`, true);
        const categories = yield ajax.GET(`${BASE_URL}/data/categories/response.json`, false);
        if (!page || !categories)
            return;
        const group = categories.find((cat) => cat.id === categoryId);
        if (!group)
            return;
        const data = yield ajax.GET(`${BASE_URL}/data/items/${group.shortName}.json`, false);
        if (!data || !data[itemId])
            return;
        const interpolatedData = ajax.interpolate(page, data[itemId]);
        if (!MAIN_DIV)
            return;
        MAIN_DIV.innerHTML = interpolatedData;
    });
}
// ! ==== !
// ! Init !
// ! ==== !
function init() {
    loadGlobalMain();
    bindHeaderButtons();
    loadHome();
}
function loadGlobalMain() {
    MAIN_DIV = document.getElementById('main');
}
document.addEventListener('DOMContentLoaded', init);
