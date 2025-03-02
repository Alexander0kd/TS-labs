interface ICategory {
    id: number;
    img: string;
    name: string;
    shortName: string;
    notes: string;

    [key: string]: unknown;
}

interface IItem {
    id: number;
    img: string;
    name: string;
    shortName: string;
    description: string;
    price: number;

    [key: string]: unknown;
}

// Ajax
const ajax = ((): {
    GET: <T>(url: string, isFile: boolean) => Promise<T | void>;
    ngFor: <T extends Record<string, unknown>>(template: string, count: number, data: T[]) => string;
    interpolate: <T extends Record<string, unknown>>(template: string, data: T) => string;
} => {
    async function GET<T>(url: string, isFile: boolean): Promise<T | void> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            if (isFile) {
                return (await response.text()) as T;
            }

            return (await response.json()) as T;
        } catch (error) {
            handleError(error, 'From [GET] function:');
        }
    }

    function ngFor<T extends Record<string, unknown>>(template: string, count: number, data: T[]): string {
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

    function interpolate<T extends Record<string, unknown>>(template: string, data: T): string {
        return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
            return String(data[key.trim()] ?? '');
        });
    }

    function handleError(error: unknown, mesage: string): void {
        // eslint-disable-next-line no-console
        console.error(mesage, error);
    }

    return {
        GET: GET,
        ngFor: ngFor,
        interpolate: interpolate,
    };
})();

let MAIN_DIV: HTMLDivElement | null = null;
const BASE_URL: string =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8080'
        : 'https://raw.githubusercontent.com/Alexander0kd/TS-labs/main/lab3/dist';

// ! ==== !
// ! Home !
// ! ==== !
async function loadHome(): Promise<void> {
    const page = await ajax.GET<string>(`${BASE_URL}/components/home.html`, true);

    if (!MAIN_DIV || !page) return;
    MAIN_DIV.innerHTML = page;

    const randomButton: HTMLButtonElement | null = document.getElementById('btn-random') as HTMLButtonElement;
    randomButton?.addEventListener('click', loadRandom);
}

function bindHeaderButtons(): void {
    const home: HTMLButtonElement | null = document.getElementById('btn-home') as HTMLButtonElement;
    home?.addEventListener('click', loadHome);

    const categories: HTMLButtonElement | null = document.getElementById('btn-catalog') as HTMLButtonElement;
    categories?.addEventListener('click', loadCategories);
}

async function loadRandom(): Promise<void> {
    const categories = await ajax.GET<ICategory[]>(`${BASE_URL}/data/categories/response.json`, false);
    if (!categories) return;

    loadCategoriesGroup(Math.floor(Math.random() * categories.length));
}

// ! ========== !
// ! Categories !
// ! ========== !
async function loadCategories(): Promise<void> {
    const page = await ajax.GET<string>(`${BASE_URL}/components/catalog.html`, true);
    const categories = await ajax.GET<ICategory[]>(`${BASE_URL}/data/categories/response.json`, false);
    if (!page || !categories) return;

    const interpolatedPage = ajax.ngFor<ICategory>(page, categories.length, categories);
    if (!MAIN_DIV) return;

    MAIN_DIV.innerHTML = `
        <div class="catalog-wrapper">
            <h2>Каталог</h2>
            <div class="catalog-items">
                    ${interpolatedPage}
            </div>
        </div>
    `;

    const buttons: HTMLCollectionOf<HTMLButtonElement> | undefined = document.getElementsByClassName(
        'catalog-name'
    ) as HTMLCollectionOf<HTMLButtonElement>;

    Array.from(buttons).forEach((btn, index) => {
        btn.addEventListener('click', () => loadCategoriesGroup(categories[index].id));
    });
}

async function loadCategoriesGroup(categoryId: number): Promise<void> {
    const page = await ajax.GET<string>(`${BASE_URL}/components/group.html`, true);
    const categories = await ajax.GET<ICategory[]>(`${BASE_URL}/data/categories/response.json`, false);
    if (!page || !categories) return;

    const group: ICategory | undefined = categories.find((cat) => cat.id === categoryId);
    if (!group) return;

    const data = await ajax.GET<IItem[]>(`${BASE_URL}/data/items/${group.shortName}.json`, false);
    if (!data) return;

    const interpolatedData = ajax.ngFor(page, data.length, data);
    if (!MAIN_DIV) return;

    MAIN_DIV.innerHTML = `
        <div class="catalog-wrapper">
            <h2>${group.name}</h2>
            <div class="catalog-items">
                ${interpolatedData}
            </div>
        </div>
    `;

    const buttons: HTMLCollectionOf<HTMLButtonElement> | undefined = document.getElementsByClassName(
        'group-name'
    ) as HTMLCollectionOf<HTMLButtonElement>;

    Array.from(buttons).forEach((btn, index) => {
        btn.addEventListener('click', () => loadItem(group.id, index));
    });
}

// ! ==== !
// ! Item !
// ! ==== !
async function loadItem(categoryId: number, itemId: number): Promise<void> {
    const page = await ajax.GET<string>(`${BASE_URL}/components/item.html`, true);
    const categories = await ajax.GET<ICategory[]>(`${BASE_URL}/data/categories/response.json`, false);
    if (!page || !categories) return;

    const group: ICategory | undefined = categories.find((cat) => cat.id === categoryId);
    if (!group) return;

    const data = await ajax.GET<IItem[]>(`${BASE_URL}/data/items/${group.shortName}.json`, false);
    if (!data || !data[itemId]) return;

    const interpolatedData = ajax.interpolate(page, data[itemId]);
    if (!MAIN_DIV) return;
    MAIN_DIV.innerHTML = interpolatedData;
}

// ! ==== !
// ! Init !
// ! ==== !
function init(): void {
    loadGlobalMain();
    bindHeaderButtons();
    loadHome();
}

function loadGlobalMain(): void {
    MAIN_DIV = document.getElementById('main') as HTMLDivElement;
}

document.addEventListener('DOMContentLoaded', init);
