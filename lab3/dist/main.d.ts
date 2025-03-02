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
declare const ajax: {
    GET: <T>(url: string, isFile: boolean) => Promise<T | void>;
    ngFor: <T extends Record<string, unknown>>(template: string, count: number, data: T[]) => string;
    interpolate: <T extends Record<string, unknown>>(template: string, data: T) => string;
};
declare let MAIN_DIV: HTMLDivElement | null;
declare const BASE_URL: string;
declare function loadHome(): Promise<void>;
declare function bindHeaderButtons(): void;
declare function loadRandom(): Promise<void>;
declare function loadCategories(): Promise<void>;
declare function loadCategoriesGroup(categoryId: number): Promise<void>;
declare function loadItem(categoryId: number, itemId: number): Promise<void>;
declare function init(): void;
declare function loadGlobalMain(): void;
