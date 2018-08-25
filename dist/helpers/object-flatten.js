"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("./object");
const Debug = require("debug");
const debug = Debug('flatten');
/**
 * Funtion to transform nested json structure to
 * flat database-like considering locatins rules
 * @param child {Object}
 * @param nested {Set}
 * @param cols {Object}
 * @param path {Array<string>}
 * @param separator {string}
 * @param noCheck {boolean}
 * @return {Object}
 */
exports.flatObject = (child, nested, cols, path = [], separator = '_', noCheck = false) => {
    const accum = {};
    const root_path = path.join(separator);
    const hasExtra = (nested && nested.has(root_path)) ? {} : null;
    debug(`path:"${path}", root_path:"${root_path}", kv: "${hasExtra}"`);
    Object.keys(child)
        .forEach((key) => {
        const val = child[key];
        const isObj = object_1.isObject(val);
        const itemPath = path.concat(key).join(separator);
        // check key has extra fields container
        const keyExtra = (nested && nested.has(itemPath)) ? {} : null;
        debug(`> ${key} [${itemPath}] `);
        // add to extra props object
        if (hasExtra && !keyExtra) {
            if (isObj) {
                debug('- 1.1');
                Object.assign(hasExtra, exports.flatObject(val, null, {}, [], separator, true));
            }
            else if (cols[itemPath]) {
                debug('- 1.2');
                accum[itemPath] = val;
            }
            else {
                debug('- 1.3');
                hasExtra[key] = val;
            }
        }
        else {
            if (isObj) {
                debug('- 2.1');
                Object.assign(accum, exports.flatObject(val, nested, cols, path.concat([key]), separator, noCheck));
            }
            else if (cols[itemPath] || noCheck) {
                debug('- 2.2');
                accum[itemPath] = val;
            }
            else {
                debug('- 2.3');
                debug(`!! not found path:${path.join('_')}_${key}, val:{val}`);
            }
        }
    });
    const extra = hasExtra && object_1.unzip(hasExtra, String, String);
    const extraPath = ([].concat(path, ['extra'])).join(separator);
    return Object.assign(accum, 
    // extra properties
    extra && { [extraPath + '.key']: extra.key, [extraPath + '.value']: extra.value } || {});
};
//# sourceMappingURL=object-flatten.js.map