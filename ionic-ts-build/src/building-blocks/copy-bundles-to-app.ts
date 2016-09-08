import { readFileSync, writeFileSync } from 'fs';

export function copyBundles(srcBundlePath: string, srcBundleMinPath: string, destBundlePath: string, destBundleMinPath: string) {
    const bundleContent = readFileSync(srcBundlePath);
    writeFileSync(destBundlePath, bundleContent);

    const bundleMinContent = readFileSync(srcBundleMinPath);
    writeFileSync(destBundleMinPath, bundleMinContent);
}