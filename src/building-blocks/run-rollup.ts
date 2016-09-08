import * as rollup from 'rollup';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as commonjs from 'rollup-plugin-commonjs';

export function runRollup(entryPointPath: string, destinationPath: string): Promise<any>{
    return rollup({
        entry: entryPointPath,
        sourceMap: true,
        plugins: [
            commonjs({}),
            nodeResolve()
        ]
    }).then((bundle: any) => {
        return bundle.write({
            format: 'iife',
            dest: destinationPath
        });
    });
}
