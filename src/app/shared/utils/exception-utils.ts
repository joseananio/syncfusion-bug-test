export function getFirstEntryFromNestedException(err: any, key?: string, recursionLevel = 0, maxNestedDepth = 99) {
  const ex = flattenException(err);
  return key ? ex[key] : undefined;
}

// TODO: Fix the issues pointed out by the linter. (She is right.)
/* eslint-disable no-restricted-syntax */

function mergeIntoParent(parent: any, child: any, nestedKey?: string) {
  // only do iterables
  if (('object' !== typeof child && !Array.isArray(child)) || ('object' !== typeof parent && !Array.isArray(parent))) {
    return false;
  }
  const keyPrefix = nestedKey ? `${nestedKey}.` : '';

  // Iterate over children, omit functions
  for (const key in child) {
    if (child.hasOwnProperty(key) && 'function' !== typeof child[key]) {
      // in case of HttpErrorResponse: flatten numeric arrays even further
      const newKey = `${nestedKey === key ? '' : keyPrefix}${key}`;

      let newChild = child[key];
      if (Array.isArray(newChild) && newChild.length === 1) {
        newChild = newChild[0];
      }
      parent[newKey] = newChild;
    }
  }

  for (const key in parent) {
    if (parent[key.replace(keyPrefix, '')] === child || 'function' === typeof parent[key] || '__proto__' === key) {
      delete parent[key];
    }
  }
  return true;
}

/**
 * Helper function: Will flatten one level of object.
 *
 * @param err
 */
function flattenObject(err: any) {
  if ('object' !== typeof err && !Array.isArray(err)) {
    return err;
  }
  const ret: { [key: string]: any } = {};

  // create a map because we can't work destructively on certain objects
  for (const key in err) {
    if (err.hasOwnProperty(key)) {
      ret[key] = err[key];
    }
  }

  // flatten first level of nested objects
  for (const key in ret) {
    if ('object' === typeof ret[key] || Array.isArray(ret[key])) {
      mergeIntoParent(ret, ret[key], key);
    }
  }

  // remove functions and empty entries
  for (const key in ret) {
    if ('function' === typeof ret[key] || null === ret[key]) {
      delete ret[key];
    }
  }
  return ret;
}

/* eslint-enable no-restricted-syntax */

export function flattenException(err: any, returnEmptyArray = true, recursionLevel = 0) {
  if (!err || recursionLevel > 99) {
    return returnEmptyArray && !err ? {} : err;
  }
  const ret = flattenObject(err);
  if (ret['error'] && mergeIntoParent(ret, ret['error'], 'error')) {
    return flattenException(ret, returnEmptyArray, recursionLevel + 1);
  }
  return ret;
}
