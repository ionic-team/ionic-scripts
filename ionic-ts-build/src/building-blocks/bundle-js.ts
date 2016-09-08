import * as rollup from 'rollup';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as commonjs from 'rollup-plugin-commonjs';

export function bundleJs(entryPointPath: string, destinationPath: string): Promise<any>{
    console.log("Entry Point: ", entryPointPath);
    console.log("Destination: ", destinationPath);
    return rollup.rollup({
        entry: entryPointPath,
        sourceMap: true,
        plugins: [
            nodeResolve({
                module: true,
                jsnext: true,
                main: true
            }),
            commonjs({
            })
        ]
    }).then((bundle: any) => {
        return bundle.write({
            format: 'iife',
            dest: destinationPath
        });
    });
}
