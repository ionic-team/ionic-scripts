export declare function componentSass(moduleIds: string[], opts?: Options): void;
export interface Options {
    outFile: string;
    file?: string;
    data?: string;
    includePaths?: string[];
    excludeModules?: string[];
    componentSassFiles?: string[];
    directoryMaps?: string[];
    sortComponentPathsFn?: (a: any, b: any) => number;
    sortComponentFilesFn?: (a: any, b: any) => number;
    variableSassFiles?: string[];
    autoprefixer?: any;
}
export interface SassResult {
    css: string;
    map: any;
}
