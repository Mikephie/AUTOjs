var freeGlobal = 'object' == typeof global && global && global.Object === Object && global;
const _freeGlobal = freeGlobal;
var freeSelf = 'object' == typeof self && self && self.Object === Object && self;
var root = _freeGlobal || freeSelf || Function('return this')();
const _root = root;
var Symbol = _root.Symbol;
const _Symbol = Symbol;
function arrayMap(array, iteratee) {
    var index = -1, length = null == array ? 0 : array.length, result = Array(length);
    while(++index < length)result[index] = iteratee(array[index], index, array);
    return result;
}
const _arrayMap = arrayMap;
var isArray_isArray = Array.isArray;
const isArray = isArray_isArray;
var objectProto = Object.prototype;
var _getRawTag_hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = _Symbol ? _Symbol.toStringTag : void 0;
function getRawTag(value) {
    var isOwn = _getRawTag_hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
        value[symToStringTag] = void 0;
        var unmasked = true;
    } catch (e) {}
    var result = nativeObjectToString.call(value);
    if (unmasked) if (isOwn) value[symToStringTag] = tag;
    else delete value[symToStringTag];
    return result;
}
const _getRawTag = getRawTag;
var _objectToString_objectProto = Object.prototype;
var _objectToString_nativeObjectToString = _objectToString_objectProto.toString;
function objectToString(value) {
    return _objectToString_nativeObjectToString.call(value);
}
const _objectToString = objectToString;
var nullTag = '[object Null]', undefinedTag = '[object Undefined]';
var _baseGetTag_symToStringTag = _Symbol ? _Symbol.toStringTag : void 0;
function baseGetTag(value) {
    if (null == value) return void 0 === value ? undefinedTag : nullTag;
    return _baseGetTag_symToStringTag && _baseGetTag_symToStringTag in Object(value) ? _getRawTag(value) : _objectToString(value);
}
const _baseGetTag = baseGetTag;
function isObjectLike(value) {
    return null != value && 'object' == typeof value;
}
const lodash_es_isObjectLike = isObjectLike;
var symbolTag = '[object Symbol]';
function isSymbol_isSymbol(value) {
    return 'symbol' == typeof value || lodash_es_isObjectLike(value) && _baseGetTag(value) == symbolTag;
}
const isSymbol = isSymbol_isSymbol;
var INFINITY = 1 / 0;
var symbolProto = _Symbol ? _Symbol.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString(value) {
    if ('string' == typeof value) return value;
    if (isArray(value)) return _arrayMap(value, baseToString) + '';
    if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : '';
    var result = value + '';
    return '0' == result && 1 / value == -INFINITY ? '-0' : result;
}
const _baseToString = baseToString;
function toString_toString(value) {
    return null == value ? '' : _baseToString(value);
}
const lodash_es_toString = toString_toString;
function basePropertyOf(object) {
    return function(key) {
        return null == object ? void 0 : object[key];
    };
}
const _basePropertyOf = basePropertyOf;
var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
};
var unescapeHtmlChar = _basePropertyOf(htmlUnescapes);
const _unescapeHtmlChar = unescapeHtmlChar;
var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reHasEscapedHtml = RegExp(reEscapedHtml.source);
function unescape_unescape(string) {
    string = lodash_es_toString(string);
    return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, _unescapeHtmlChar) : string;
}
const lodash_es_unescape = unescape_unescape;
function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
}
const _listCacheClear = listCacheClear;
function eq(value, other) {
    return value === other || value !== value && other !== other;
}
const lodash_es_eq = eq;
function assocIndexOf(array, key) {
    var length = array.length;
    while(length--)if (lodash_es_eq(array[length][0], key)) return length;
    return -1;
}
const _assocIndexOf = assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
    var data = this.__data__, index = _assocIndexOf(data, key);
    if (index < 0) return false;
    var lastIndex = data.length - 1;
    if (index == lastIndex) data.pop();
    else splice.call(data, index, 1);
    --this.size;
    return true;
}
const _listCacheDelete = listCacheDelete;
function listCacheGet(key) {
    var data = this.__data__, index = _assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
}
const _listCacheGet = listCacheGet;
function listCacheHas(key) {
    return _assocIndexOf(this.__data__, key) > -1;
}
const _listCacheHas = listCacheHas;
function listCacheSet(key, value) {
    var data = this.__data__, index = _assocIndexOf(data, key);
    if (index < 0) {
        ++this.size;
        data.push([
            key,
            value
        ]);
    } else data[index][1] = value;
    return this;
}
const _listCacheSet = listCacheSet;
function ListCache(entries) {
    var index = -1, length = null == entries ? 0 : entries.length;
    this.clear();
    while(++index < length){
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;
const _ListCache = ListCache;
function stackClear() {
    this.__data__ = new _ListCache;
    this.size = 0;
}
const _stackClear = stackClear;
function stackDelete(key) {
    var data = this.__data__, result = data['delete'](key);
    this.size = data.size;
    return result;
}
const _stackDelete = stackDelete;
function stackGet(key) {
    return this.__data__.get(key);
}
const _stackGet = stackGet;
function stackHas(key) {
    return this.__data__.has(key);
}
const _stackHas = stackHas;
function isObject(value) {
    var type = typeof value;
    return null != value && ('object' == type || 'function' == type);
}
const lodash_es_isObject = isObject;
var asyncTag = '[object AsyncFunction]', funcTag = '[object Function]', genTag = '[object GeneratorFunction]', proxyTag = '[object Proxy]';
function isFunction_isFunction(value) {
    if (!lodash_es_isObject(value)) return false;
    var tag = _baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
const isFunction = isFunction_isFunction;
var coreJsData = _root["__core-js_shared__"];
const _coreJsData = coreJsData;
var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
}();
function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
}
const _isMasked = isMasked;
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
function toSource(func) {
    if (null != func) {
        try {
            return funcToString.call(func);
        } catch (e) {}
        try {
            return func + '';
        } catch (e) {}
    }
    return '';
}
const _toSource = toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var _baseIsNative_funcProto = Function.prototype, _baseIsNative_objectProto = Object.prototype;
var _baseIsNative_funcToString = _baseIsNative_funcProto.toString;
var _baseIsNative_hasOwnProperty = _baseIsNative_objectProto.hasOwnProperty;
var reIsNative = RegExp('^' + _baseIsNative_funcToString.call(_baseIsNative_hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
function baseIsNative(value) {
    if (!lodash_es_isObject(value) || _isMasked(value)) return false;
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
}
const _baseIsNative = baseIsNative;
function getValue(object, key) {
    return null == object ? void 0 : object[key];
}
const _getValue = getValue;
function getNative(object, key) {
    var value = _getValue(object, key);
    return _baseIsNative(value) ? value : void 0;
}
const _getNative = getNative;
var Map = _getNative(_root, 'Map');
const _Map = Map;
var nativeCreate = _getNative(Object, 'create');
const _nativeCreate = nativeCreate;
function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
}
const _hashClear = hashClear;
function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
}
const _hashDelete = hashDelete;
var HASH_UNDEFINED = '__lodash_hash_undefined__';
var _hashGet_objectProto = Object.prototype;
var _hashGet_hasOwnProperty = _hashGet_objectProto.hasOwnProperty;
function hashGet(key) {
    var data = this.__data__;
    if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
    }
    return _hashGet_hasOwnProperty.call(data, key) ? data[key] : void 0;
}
const _hashGet = hashGet;
var _hashHas_objectProto = Object.prototype;
var _hashHas_hasOwnProperty = _hashHas_objectProto.hasOwnProperty;
function hashHas(key) {
    var data = this.__data__;
    return _nativeCreate ? void 0 !== data[key] : _hashHas_hasOwnProperty.call(data, key);
}
const _hashHas = hashHas;
var _hashSet_HASH_UNDEFINED = '__lodash_hash_undefined__';
function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = _nativeCreate && void 0 === value ? _hashSet_HASH_UNDEFINED : value;
    return this;
}
const _hashSet = hashSet;
function Hash(entries) {
    var index = -1, length = null == entries ? 0 : entries.length;
    this.clear();
    while(++index < length){
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;
const _Hash = Hash;
function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
        hash: new _Hash,
        map: new (_Map || _ListCache),
        string: new _Hash
    };
}
const _mapCacheClear = mapCacheClear;
function isKeyable(value) {
    var type = typeof value;
    return 'string' == type || 'number' == type || 'symbol' == type || 'boolean' == type ? '__proto__' !== value : null === value;
}
const _isKeyable = isKeyable;
function getMapData(map, key) {
    var data = map.__data__;
    return _isKeyable(key) ? data['string' == typeof key ? 'string' : 'hash'] : data.map;
}
const _getMapData = getMapData;
function mapCacheDelete(key) {
    var result = _getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
}
const _mapCacheDelete = mapCacheDelete;
function mapCacheGet(key) {
    return _getMapData(this, key).get(key);
}
const _mapCacheGet = mapCacheGet;
function mapCacheHas(key) {
    return _getMapData(this, key).has(key);
}
const _mapCacheHas = mapCacheHas;
function mapCacheSet(key, value) {
    var data = _getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
}
const _mapCacheSet = mapCacheSet;
function MapCache(entries) {
    var index = -1, length = null == entries ? 0 : entries.length;
    this.clear();
    while(++index < length){
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;
const _MapCache = MapCache;
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([
                key,
                value
            ]);
            this.size = ++data.size;
            return this;
        }
        data = this.__data__ = new _MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
}
const _stackSet = stackSet;
function Stack(entries) {
    var data = this.__data__ = new _ListCache(entries);
    this.size = data.size;
}
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;
const _Stack = Stack;
var defineProperty = function() {
    try {
        var func = _getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
    } catch (e) {}
}();
const _defineProperty = defineProperty;
function baseAssignValue(object, key, value) {
    if ('__proto__' == key && _defineProperty) _defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true
    });
    else object[key] = value;
}
const _baseAssignValue = baseAssignValue;
function assignMergeValue(object, key, value) {
    if (void 0 !== value && !lodash_es_eq(object[key], value) || void 0 === value && !(key in object)) _baseAssignValue(object, key, value);
}
const _assignMergeValue = assignMergeValue;
function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while(length--){
            var key = props[fromRight ? length : ++index];
            if (false === iteratee(iterable[key], key, iterable)) break;
        }
        return object;
    };
}
const _createBaseFor = createBaseFor;
var baseFor = _createBaseFor();
const _baseFor = baseFor;
var freeExports = 'object' == typeof exports && exports && !exports.nodeType && exports;
var freeModule = freeExports && 'object' == typeof module && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? _root.Buffer : void 0, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
    if (isDeep) return buffer.slice();
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
}
const _cloneBuffer = cloneBuffer;
var Uint8Array = _root.Uint8Array;
const _Uint8Array = Uint8Array;
function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
    return result;
}
const _cloneArrayBuffer = cloneArrayBuffer;
function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
const _cloneTypedArray = cloneTypedArray;
function copyArray(source, array) {
    var index = -1, length = source.length;
    array || (array = Array(length));
    while(++index < length)array[index] = source[index];
    return array;
}
const _copyArray = copyArray;
var objectCreate = Object.create;
var baseCreate = function() {
    function object() {}
    return function(proto) {
        if (!lodash_es_isObject(proto)) return {};
        if (objectCreate) return objectCreate(proto);
        object.prototype = proto;
        var result = new object;
        object.prototype = void 0;
        return result;
    };
}();
const _baseCreate = baseCreate;
function overArg(func, transform) {
    return function(arg) {
        return func(transform(arg));
    };
}
const _overArg = overArg;
var getPrototype = _overArg(Object.getPrototypeOf, Object);
const _getPrototype = getPrototype;
var _isPrototype_objectProto = Object.prototype;
function isPrototype(value) {
    var Ctor = value && value.constructor, proto = 'function' == typeof Ctor && Ctor.prototype || _isPrototype_objectProto;
    return value === proto;
}
const _isPrototype = isPrototype;
function initCloneObject(object) {
    return 'function' != typeof object.constructor || _isPrototype(object) ? {} : _baseCreate(_getPrototype(object));
}
const _initCloneObject = initCloneObject;
var argsTag = '[object Arguments]';
function baseIsArguments(value) {
    return lodash_es_isObjectLike(value) && _baseGetTag(value) == argsTag;
}
const _baseIsArguments = baseIsArguments;
var isArguments_objectProto = Object.prototype;
var isArguments_hasOwnProperty = isArguments_objectProto.hasOwnProperty;
var propertyIsEnumerable = isArguments_objectProto.propertyIsEnumerable;
var isArguments_isArguments = _baseIsArguments(function() {
    return arguments;
}()) ? _baseIsArguments : function(value) {
    return lodash_es_isObjectLike(value) && isArguments_hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
const isArguments = isArguments_isArguments;
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
    return 'number' == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
const lodash_es_isLength = isLength;
function isArrayLike_isArrayLike(value) {
    return null != value && lodash_es_isLength(value.length) && !isFunction(value);
}
const isArrayLike = isArrayLike_isArrayLike;
function isArrayLikeObject_isArrayLikeObject(value) {
    return lodash_es_isObjectLike(value) && isArrayLike(value);
}
const isArrayLikeObject = isArrayLikeObject_isArrayLikeObject;
function stubFalse_stubFalse() {
    return false;
}
const stubFalse = stubFalse_stubFalse;
var isBuffer_freeExports = 'object' == typeof exports && exports && !exports.nodeType && exports;
var isBuffer_freeModule = isBuffer_freeExports && 'object' == typeof module && module && !module.nodeType && module;
var isBuffer_moduleExports = isBuffer_freeModule && isBuffer_freeModule.exports === isBuffer_freeExports;
var isBuffer_Buffer = isBuffer_moduleExports ? _root.Buffer : void 0;
var nativeIsBuffer = isBuffer_Buffer ? isBuffer_Buffer.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
const lodash_es_isBuffer = isBuffer;
var objectTag = '[object Object]';
var isPlainObject_funcProto = Function.prototype, isPlainObject_objectProto = Object.prototype;
var isPlainObject_funcToString = isPlainObject_funcProto.toString;
var isPlainObject_hasOwnProperty = isPlainObject_objectProto.hasOwnProperty;
var objectCtorString = isPlainObject_funcToString.call(Object);
function isPlainObject(value) {
    if (!lodash_es_isObjectLike(value) || _baseGetTag(value) != objectTag) return false;
    var proto = _getPrototype(value);
    if (null === proto) return true;
    var Ctor = isPlainObject_hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return 'function' == typeof Ctor && Ctor instanceof Ctor && isPlainObject_funcToString.call(Ctor) == objectCtorString;
}
const lodash_es_isPlainObject = isPlainObject;
var _baseIsTypedArray_argsTag = '[object Arguments]', arrayTag = '[object Array]', boolTag = '[object Boolean]', dateTag = '[object Date]', errorTag = '[object Error]', _baseIsTypedArray_funcTag = '[object Function]', mapTag = '[object Map]', numberTag = '[object Number]', _baseIsTypedArray_objectTag = '[object Object]', regexpTag = '[object RegExp]', setTag = '[object Set]', stringTag = '[object String]', weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]', dataViewTag = '[object DataView]', float32Tag = '[object Float32Array]', float64Tag = '[object Float64Array]', int8Tag = '[object Int8Array]', int16Tag = '[object Int16Array]', int32Tag = '[object Int32Array]', uint8Tag = '[object Uint8Array]', uint8ClampedTag = '[object Uint8ClampedArray]', uint16Tag = '[object Uint16Array]', uint32Tag = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[_baseIsTypedArray_argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[_baseIsTypedArray_funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[_baseIsTypedArray_objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
    return lodash_es_isObjectLike(value) && lodash_es_isLength(value.length) && !!typedArrayTags[_baseGetTag(value)];
}
const _baseIsTypedArray = baseIsTypedArray;
function baseUnary(func) {
    return function(value) {
        return func(value);
    };
}
const _baseUnary = baseUnary;
var _nodeUtil_freeExports = 'object' == typeof exports && exports && !exports.nodeType && exports;
var _nodeUtil_freeModule = _nodeUtil_freeExports && 'object' == typeof module && module && !module.nodeType && module;
var _nodeUtil_moduleExports = _nodeUtil_freeModule && _nodeUtil_freeModule.exports === _nodeUtil_freeExports;
var freeProcess = _nodeUtil_moduleExports && _freeGlobal.process;
var nodeUtil = function() {
    try {
        var types = _nodeUtil_freeModule && _nodeUtil_freeModule.require && _nodeUtil_freeModule.require('util').types;
        if (types) return types;
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
}();
const _nodeUtil = nodeUtil;
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;
var isTypedArray_isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
const isTypedArray = isTypedArray_isTypedArray;
function safeGet(object, key) {
    if ('constructor' === key && 'function' == typeof object[key]) return;
    if ('__proto__' == key) return;
    return object[key];
}
const _safeGet = safeGet;
var _assignValue_objectProto = Object.prototype;
var _assignValue_hasOwnProperty = _assignValue_objectProto.hasOwnProperty;
function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(_assignValue_hasOwnProperty.call(object, key) && lodash_es_eq(objValue, value)) || void 0 === value && !(key in object)) _baseAssignValue(object, key, value);
}
const _assignValue = assignValue;
function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1, length = props.length;
    while(++index < length){
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (void 0 === newValue) newValue = source[key];
        if (isNew) _baseAssignValue(object, key, newValue);
        else _assignValue(object, key, newValue);
    }
    return object;
}
const _copyObject = copyObject;
function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while(++index < n)result[index] = iteratee(index);
    return result;
}
const _baseTimes = baseTimes;
var _isIndex_MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
    var type = typeof value;
    length = null == length ? _isIndex_MAX_SAFE_INTEGER : length;
    return !!length && ('number' == type || 'symbol' != type && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}
const _isIndex = isIndex;
var _arrayLikeKeys_objectProto = Object.prototype;
var _arrayLikeKeys_hasOwnProperty = _arrayLikeKeys_objectProto.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && lodash_es_isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? _baseTimes(value.length, String) : [], length = result.length;
    for(var key in value)if ((inherited || _arrayLikeKeys_hasOwnProperty.call(value, key)) && !(skipIndexes && ('length' == key || isBuff && ('offset' == key || 'parent' == key) || isType && ('buffer' == key || 'byteLength' == key || 'byteOffset' == key) || _isIndex(key, length)))) result.push(key);
    return result;
}
const _arrayLikeKeys = arrayLikeKeys;
function nativeKeysIn(object) {
    var result = [];
    if (null != object) for(var key in Object(object))result.push(key);
    return result;
}
const _nativeKeysIn = nativeKeysIn;
var _baseKeysIn_objectProto = Object.prototype;
var _baseKeysIn_hasOwnProperty = _baseKeysIn_objectProto.hasOwnProperty;
function baseKeysIn(object) {
    if (!lodash_es_isObject(object)) return _nativeKeysIn(object);
    var isProto = _isPrototype(object), result = [];
    for(var key in object)if (!('constructor' == key && (isProto || !_baseKeysIn_hasOwnProperty.call(object, key)))) result.push(key);
    return result;
}
const _baseKeysIn = baseKeysIn;
function keysIn(object) {
    return isArrayLike(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}
const lodash_es_keysIn = keysIn;
function toPlainObject(value) {
    return _copyObject(value, lodash_es_keysIn(value));
}
const lodash_es_toPlainObject = toPlainObject;
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = _safeGet(object, key), srcValue = _safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) return void _assignMergeValue(object, key, stacked);
    var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : void 0;
    var isCommon = void 0 === newValue;
    if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && lodash_es_isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) if (isArray(objValue)) newValue = objValue;
        else if (isArrayLikeObject(objValue)) newValue = _copyArray(objValue);
        else if (isBuff) {
            isCommon = false;
            newValue = _cloneBuffer(srcValue, true);
        } else if (isTyped) {
            isCommon = false;
            newValue = _cloneTypedArray(srcValue, true);
        } else newValue = [];
        else if (lodash_es_isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) newValue = lodash_es_toPlainObject(objValue);
            else if (!lodash_es_isObject(objValue) || isFunction(objValue)) newValue = _initCloneObject(srcValue);
        } else isCommon = false;
    }
    if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
    }
    _assignMergeValue(object, key, newValue);
}
const _baseMergeDeep = baseMergeDeep;
function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) return;
    _baseFor(source, function(srcValue, key) {
        stack || (stack = new _Stack);
        if (lodash_es_isObject(srcValue)) _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        else {
            var newValue = customizer ? customizer(_safeGet(object, key), srcValue, key + '', object, source, stack) : void 0;
            if (void 0 === newValue) newValue = srcValue;
            _assignMergeValue(object, key, newValue);
        }
    }, lodash_es_keysIn);
}
const _baseMerge = baseMerge;
function identity(value) {
    return value;
}
const lodash_es_identity = identity;
function apply(func, thisArg, args) {
    switch(args.length){
        case 0:
            return func.call(thisArg);
        case 1:
            return func.call(thisArg, args[0]);
        case 2:
            return func.call(thisArg, args[0], args[1]);
        case 3:
            return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
}
const _apply = apply;
var nativeMax = Math.max;
function overRest(func, start, transform) {
    start = nativeMax(void 0 === start ? func.length - 1 : start, 0);
    return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while(++index < length)array[index] = args[start + index];
        index = -1;
        var otherArgs = Array(start + 1);
        while(++index < start)otherArgs[index] = args[index];
        otherArgs[start] = transform(array);
        return _apply(func, this, otherArgs);
    };
}
const _overRest = overRest;
function constant(value) {
    return function() {
        return value;
    };
}
const lodash_es_constant = constant;
var baseSetToString = _defineProperty ? function(func, string) {
    return _defineProperty(func, 'toString', {
        configurable: true,
        enumerable: false,
        value: lodash_es_constant(string),
        writable: true
    });
} : lodash_es_identity;
const _baseSetToString = baseSetToString;
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
            if (++count >= HOT_COUNT) return arguments[0];
        } else count = 0;
        return func.apply(void 0, arguments);
    };
}
const _shortOut = shortOut;
var setToString = _shortOut(_baseSetToString);
const _setToString = setToString;
function baseRest(func, start) {
    return _setToString(_overRest(func, start, lodash_es_identity), func + '');
}
const _baseRest = baseRest;
function isIterateeCall(value, index, object) {
    if (!lodash_es_isObject(object)) return false;
    var type = typeof index;
    if ('number' == type ? isArrayLike(object) && _isIndex(index, object.length) : 'string' == type && index in object) return lodash_es_eq(object[index], value);
    return false;
}
const _isIterateeCall = isIterateeCall;
function createAssigner(assigner) {
    return _baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && 'function' == typeof customizer ? (length--, customizer) : void 0;
        if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? void 0 : customizer;
            length = 1;
        }
        object = Object(object);
        while(++index < length){
            var source = sources[index];
            if (source) assigner(object, source, index, customizer);
        }
        return object;
    });
}
const _createAssigner = createAssigner;
var merge = _createAssigner(function(object, source, srcIndex) {
    _baseMerge(object, source, srcIndex);
});
const lodash_es_merge = merge;
function _define_property(obj, key, value) {
    if (key in obj) Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    else obj[key] = value;
    return obj;
}
const DEFAULT_HEADERS = {
    'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
};
class WidgetAPI {
    async get(url, options) {
        let baseOptions = {
            headers: DEFAULT_HEADERS
        };
        if (this.getDefaultOptions) try {
            const defaultOptions = await this.getDefaultOptions();
            baseOptions = lodash_es_merge(baseOptions, defaultOptions);
        } catch (error) {
            console.warn("获取默认配置失败，使用基础配置:", error);
        }
        const finalOptions = lodash_es_merge(baseOptions, options);
        try {
            const resp = await Widget.http.get(url, finalOptions);
            if (!resp || 200 !== resp.statusCode) throw new Error(`\u{8BF7}\u{6C42}\u{5931}\u{8D25}: ${(null == resp ? void 0 : resp.statusCode) || "未知错误"}`);
            return resp.data;
        } catch (error) {
            throw new Error(`\u{7F51}\u{7EDC}\u{8BF7}\u{6C42}\u{5931}\u{8D25}: ${error instanceof Error ? error.message : "未知错误"}`);
        }
    }
    async getHtml(url, options) {
        const resp = await this.get(url, options);
        return Widget.html.load(resp);
    }
    constructor(getDefaultOptions){
        _define_property(this, "getDefaultOptions", void 0);
        this.getDefaultOptions = getDefaultOptions;
    }
}
async function getStorageItem(key) {
    return Promise.race([
        Widget.storage.getItem(key),
        new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 1000))
    ]);
}
async function setStorageItem(key, value) {
    return Promise.race([
        Widget.storage.setItem(key, value),
        new Promise((_, reject)=>setTimeout(()=>reject(new Error('timeout')), 1000))
    ]);
}
const BASE_URL = 'https://www.xvideos.com';
const widgetAPI = new WidgetAPI(async ()=>{
    try {
        const sessionToken = await getStorageItem('xvideos.session_token');
        console.log('sessionToken', sessionToken);
        return {
            headers: {
                Cookie: `session_token=${sessionToken}`
            }
        };
    } catch (error) {
        console.error("获取默认配置失败，使用基础配置:", error);
        return {};
    }
});
WidgetMetadata = {
    id: 'xvideos',
    title: 'XVideos',
    description: 'XVideos',
    author: "Mikephie",
    version: "2.0.0",
    requiredVersion: '0.0.1',
    site: 'https://github.com/baranwang/forward-widget',
    detailCacheDuration: 1,
    modules: [
        {
            id: 'xvideos.new',
            title: "最新视频",
            description: "XVideos 最新视频",
            functionName: 'getNewList',
            params: [
                {
                    name: 'page',
                    title: "页码",
                    type: 'page',
                    value: '0'
                }
            ]
        },
        {
            id: 'xvideos.channel',
            title: "频道",
            description: "XVideos 频道",
            functionName: 'getChannelList',
            params: [
                {
                    name: 'channel',
                    title: "频道",
                    type: 'input',
                    value: '',
                    placeholders: [
                        {
                            title: 'AsiaM',
                            value: 'asiam'
                        },
                        {
                            title: 'AV Jiali',
                            value: 'av-jiali'
                        },
                        {
                            title: 'Japanesecreampiesystem717',
                            value: 'japanese_creampie_system717'
                        },
                        {
                            title: 'StockingsCat',
                            value: 'stockingscat'
                        },
                        {
                            title: 'Japan HDV',
                            value: 'japan-hdv'
                        },
                        {
                            title: 'Jav HD',
                            value: 'javhd'
                        },
                        {
                            title: 'Caribbeancom',
                            value: 'caribbeancom'
                        },
                        {
                            title: 'Hisidepon',
                            value: 'hisidepon'
                        },
                        {
                            title: 'Monmon Tw',
                            value: 'monmon_tw'
                        },
                        {
                            title: 'MOON FORCE',
                            value: 'moonforce'
                        },
                        {
                            title: 'Mya Mya',
                            value: 'myanma_porn'
                        },
                        {
                            title: 'Zzzgirlxxx',
                            value: 'zzzgirlxxx'
                        },
                        {
                            title: 'Guodong Media',
                            value: 'guodong_media'
                        },
                        {
                            title: 'Aipornmix',
                            value: 'aipornmix1'
                        },
                        {
                            title: 'YOSUGA',
                            value: 'yosuga'
                        },
                        {
                            title: 'Momoka',
                            value: 'japanese31'
                        },
                        {
                            title: 'Raptor Inc',
                            value: 'raptor_inc'
                        },
                        {
                            title: 'Girls of HEL',
                            value: 'girlsofhel_official'
                        },
                        {
                            title: 'Armadillo',
                            value: 'shiroutotv'
                        },
                        {
                            title: '1pondo',
                            value: 'ipondo'
                        },
                        {
                            title: 'Swaglive',
                            value: 'swaglive'
                        },
                        {
                            title: 'NIKSINDIAN',
                            value: 'niks_indian'
                        },
                        {
                            title: 'Jimmyreload',
                            value: 'jimmyreload'
                        },
                        {
                            title: 'S Cute Official',
                            value: 's-cute-official'
                        },
                        {
                            title: 'Zenra',
                            value: 'zenra-subtitled-japanese-av'
                        },
                        {
                            title: 'Japaneserxrx',
                            value: 'japaneserxrx'
                        },
                        {
                            title: 'Claire0607018',
                            value: 'claire0607018'
                        },
                        {
                            title: 'JapBliss',
                            value: 'japbliss'
                        },
                        {
                            title: 'Hey Milf',
                            value: 'heymilf'
                        },
                        {
                            title: 'Tenshigao',
                            value: 'tenshigao'
                        },
                        {
                            title: 'AV 69',
                            value: 'av69tv'
                        },
                        {
                            title: 'Ronysworld',
                            value: 'ronysworld'
                        },
                        {
                            title: 'Uttaran20',
                            value: 'uttaran20'
                        },
                        {
                            title: 'Jukujosukidesu',
                            value: 'jukujosukidesu'
                        },
                        {
                            title: 'Schoolgirls HD',
                            value: 'schoolgirlshd'
                        },
                        {
                            title: 'Psychoporn Tw',
                            value: 'psychoporn_tw'
                        },
                        {
                            title: 'Hotxvip',
                            value: 'hotxvip1'
                        },
                        {
                            title: 'Kmib',
                            value: 'k-mib'
                        },
                        {
                            title: 'Javhub',
                            value: 'javhub'
                        },
                        {
                            title: 'DirectorTONG',
                            value: 'directortong1'
                        },
                        {
                            title: 'Toptenxx',
                            value: 'top_tenxxx'
                        },
                        {
                            title: 'Kimberlisah',
                            value: 'rapliandae'
                        },
                        {
                            title: 'Xx66689',
                            value: 'xx66689'
                        },
                        {
                            title: 'Indigosin',
                            value: 'indigo_sin'
                        },
                        {
                            title: 'HEYZO',
                            value: 'heyzo-xxx'
                        },
                        {
                            title: 'Elle Lee Official',
                            value: 'elle_lee_official'
                        },
                        {
                            title: 'MAX-Japanese',
                            value: 'max-japanese'
                        },
                        {
                            title: 'Kninebox',
                            value: 'kninebox'
                        },
                        {
                            title: 'HotyNitu',
                            value: 'villagefuke1_official'
                        },
                        {
                            title: 'Ferame',
                            value: 'ferame'
                        },
                        {
                            title: 'Babeneso',
                            value: 'babeneso'
                        },
                        {
                            title: 'Yellowgamesbyjason',
                            value: 'yellow_games_by_jason'
                        },
                        {
                            title: 'Creampiedaily',
                            value: 'creampiedaily'
                        },
                        {
                            title: 'YellowPlum',
                            value: 'yellowplum'
                        },
                        {
                            title: 'Pikkur.com',
                            value: 'pikkurcom'
                        },
                        {
                            title: 'Hotxcreator',
                            value: 'hotxcreator'
                        },
                        {
                            title: 'Kopihitamenak',
                            value: 'kopihitamenak'
                        },
                        {
                            title: 'Mistress Land',
                            value: 'mistressland'
                        },
                        {
                            title: 'Gogouncensored',
                            value: 'gogouncensored'
                        },
                        {
                            title: 'AV Tits',
                            value: 'avtits'
                        },
                        {
                            title: 'Peach Japan',
                            value: 'peach_japan'
                        },
                        {
                            title: 'Marutahub',
                            value: 'marutahub'
                        },
                        {
                            title: 'Neonxvip',
                            value: 'neonxvip'
                        },
                        {
                            title: 'Emuyumi Couple',
                            value: 'emuyumi-couple'
                        },
                        {
                            title: 'Venna',
                            value: 'venna84'
                        },
                        {
                            title: 'Monger In Asia',
                            value: 'monger-in-asia'
                        },
                        {
                            title: 'All Japanese Pass',
                            value: 'alljapanesepass'
                        },
                        {
                            title: 'Indianxworld',
                            value: 'indianxworld'
                        },
                        {
                            title: 'Golupaa',
                            value: 'ratanprem009'
                        },
                        {
                            title: 'Riya Bhabhi1',
                            value: 'riya_bhabhi1'
                        },
                        {
                            title: 'Horny Indian Couple',
                            value: 'hornyindiancouple'
                        },
                        {
                            title: 'AV Stockings',
                            value: 'avstockings'
                        },
                        {
                            title: 'Asians Bondage',
                            value: 'asians-bondage'
                        },
                        {
                            title: 'sexworld',
                            value: 'sexworld72'
                        },
                        {
                            title: 'Eagle MILF',
                            value: 'eagle-milf'
                        },
                        {
                            title: 'Nana69',
                            value: 'nana01921'
                        },
                        {
                            title: 'Doggy',
                            value: 'doggy2198'
                        },
                        {
                            title: 'Netuandhubby',
                            value: 'netu_and_hubby'
                        },
                        {
                            title: 'PETERS',
                            value: 'peters-1'
                        },
                        {
                            title: 'Osakaporn',
                            value: 'osakaporn'
                        }
                    ]
                },
                {
                    name: 'page',
                    title: "页码",
                    type: 'page',
                    value: '0'
                }
            ]
        },
        {
            id: 'xvideos.pornstars',
            title: "色情明星",
            description: "XVideos 色情明星",
            functionName: 'getPornstarsList',
            params: [
                {
                    name: 'pornstar',
                    title: "色情明星",
                    type: 'input',
                    placeholders: [
                        {
                            title: 'Mandy Flores',
                            value: 'Mandy Flores'
                        },
                        {
                            title: 'Nancy A.',
                            value: 'Nancy A.'
                        },
                        {
                            title: 'Eva Elfie',
                            value: 'Eva Elfie'
                        },
                        {
                            title: 'Momoka',
                            value: 'momoka142'
                        },
                        {
                            title: 'Yui Hatano',
                            value: 'yui-hatano-1'
                        },
                        {
                            title: 'Rae Lil Black',
                            value: 'rae-lil-black'
                        },
                        {
                            title: 'Hushixiaolu',
                            value: 'hushixiaolu2'
                        },
                        {
                            title: 'Monmon Tw',
                            value: 'monmon_tw1'
                        },
                        {
                            title: 'Emiri Momota',
                            value: 'emiri-momota'
                        },
                        {
                            title: 'Mao Hamasaki',
                            value: 'mao-hamasaki'
                        },
                        {
                            title: 'Anri Okita',
                            value: 'anri-okita'
                        },
                        {
                            title: 'Eimi Fukada',
                            value: 'eimi-fukada'
                        },
                        {
                            title: 'Ai Li',
                            value: 'ai-li-model'
                        },
                        {
                            title: 'Azumi Miz',
                            value: 'azumi-miz'
                        },
                        {
                            title: 'Rei Mizuna',
                            value: 'rei_mizuna'
                        },
                        {
                            title: 'Suzu Ichinose',
                            value: 'suzu-ichinose'
                        },
                        {
                            title: 'Yuuri Himeno',
                            value: 'yuuri-himeno'
                        },
                        {
                            title: 'May Thai',
                            value: 'may-thai'
                        },
                        {
                            title: 'Cantika',
                            value: 'cantika259'
                        },
                        {
                            title: 'Aimi Yoshikawa',
                            value: 'aimi-yoshikawa'
                        },
                        {
                            title: 'Miku Ohashi',
                            value: 'miku-ohashi-1'
                        },
                        {
                            title: 'Sudipa',
                            value: 'sudipa20'
                        },
                        {
                            title: 'Timepasserby',
                            value: 'timepasserby2'
                        },
                        {
                            title: 'Lee Chae Dam',
                            value: 'lee-chae-dam'
                        },
                        {
                            title: 'Teju',
                            value: 'teju-model'
                        },
                        {
                            title: "李蓉蓉 Li Rong Rong",
                            value: 'li-rong-rong'
                        },
                        {
                            title: 'Erika Momotani',
                            value: 'erika-momotani'
                        },
                        {
                            title: 'Reiko Kobayakawa',
                            value: 'reiko-kobayakawa'
                        },
                        {
                            title: 'Maki Houjo',
                            value: 'maki-houjo'
                        },
                        {
                            title: 'Miho Ichiki',
                            value: 'miho-ichiki-model'
                        },
                        {
                            title: 'Ai Uehara',
                            value: 'ai-uehara'
                        },
                        {
                            title: 'Maron Natsuki',
                            value: 'maron-natsuki'
                        },
                        {
                            title: 'Kaori Maeda',
                            value: 'kaori-maeda'
                        },
                        {
                            title: 'Sangecrot4',
                            value: 'tika1093'
                        },
                        {
                            title: 'Ai Xi',
                            value: 'ai-xi'
                        },
                        {
                            title: 'Ranako',
                            value: 'ranako-model'
                        },
                        {
                            title: 'Iori Kogawa',
                            value: 'iori-kogawa'
                        },
                        {
                            title: 'Rei Kitajima',
                            value: 'rei-kitajima-1'
                        },
                        {
                            title: 'Su Chang',
                            value: 'su-chang-model'
                        },
                        {
                            title: 'Kana Morisawa',
                            value: 'kana-morisawa'
                        },
                        {
                            title: 'Maria Nagai',
                            value: 'maria-nagai'
                        },
                        {
                            title: 'Mei Matsumoto',
                            value: 'mei-matsumoto'
                        },
                        {
                            title: 'Akari Asagiri',
                            value: 'akari-asagiri'
                        },
                        {
                            title: 'Yuu Shinoda',
                            value: 'yuu-shinoda'
                        },
                        {
                            title: 'Ren Azumi',
                            value: 'ren-azumi'
                        },
                        {
                            title: 'Xiao Ye Ye',
                            value: 'xiao-ye-ye'
                        },
                        {
                            title: 'Mitsuki Akai',
                            value: 'marie-konishi'
                        },
                        {
                            title: 'Kaede Niiyama',
                            value: 'kaede-niiyama'
                        },
                        {
                            title: 'Aoi Shirosaki',
                            value: 'aoi-shirosaki-1'
                        },
                        {
                            title: 'Hitomi Tanaka',
                            value: 'hitomi-tanaka'
                        },
                        {
                            title: 'Baebi Hel',
                            value: 'baebi-hel'
                        },
                        {
                            title: 'Hana Haruna',
                            value: 'haruna-hana'
                        },
                        {
                            title: 'Satomi Suzuki',
                            value: 'satomi-suzuki'
                        },
                        {
                            title: 'Ruka Kanae',
                            value: 'ruka-kanae'
                        },
                        {
                            title: 'Li998',
                            value: 'li998-model'
                        },
                        {
                            title: 'Wudalan',
                            value: 'wudalan3'
                        },
                        {
                            title: 'Tuna Kimura',
                            value: 'tsuna-kimura'
                        },
                        {
                            title: 'Misaki',
                            value: 'misaki467'
                        },
                        {
                            title: 'Julia Boin',
                            value: 'julia-kyoka'
                        },
                        {
                            title: 'Shathi Khatun',
                            value: 'shathi-khatun1'
                        },
                        {
                            title: 'Ruri Saijo',
                            value: 'ruri_saijo_official1'
                        },
                        {
                            title: 'Cherrycat',
                            value: 'cherrycat-model'
                        },
                        {
                            title: 'Reona Kirishima',
                            value: 'reona-kirishima'
                        },
                        {
                            title: 'Emiri Suzuhara',
                            value: 'emiri-suzuhara-1'
                        },
                        {
                            title: 'Yua Mikami',
                            value: 'yua-mikami'
                        },
                        {
                            title: 'Sisty',
                            value: 'sisty-model'
                        },
                        {
                            title: 'Rie Tachikawa',
                            value: 'rie-tachikawa'
                        },
                        {
                            title: 'Momoka Nishina',
                            value: 'momoka-nishina-1'
                        },
                        {
                            title: 'Una',
                            value: 'pptw2'
                        },
                        {
                            title: 'Mia Khalifa',
                            value: 'mia-khalifa-model'
                        },
                        {
                            title: 'Emiri Okazaki',
                            value: 'emiri-okazaki'
                        },
                        {
                            title: 'Aditi Arya',
                            value: 'aditi-arya-model'
                        },
                        {
                            title: 'Marina Yuzuki',
                            value: 'marina-yuzuki'
                        },
                        {
                            title: 'Shen Na Na',
                            value: 'shen-na-na'
                        },
                        {
                            title: 'Jimmys Model L',
                            value: 'jimmys-model-l'
                        },
                        {
                            title: 'Maria Ozawa',
                            value: 'maria-ozawa'
                        },
                        {
                            title: 'Nono',
                            value: 'nono13884'
                        },
                        {
                            title: 'Sakura Soh',
                            value: 'sakura-soh-model'
                        },
                        {
                            title: 'Ichika Matsumoto',
                            value: 'ichika-matsumoto'
                        },
                        {
                            title: 'Xia Qing Zi',
                            value: 'xia-qing-zi1'
                        },
                        {
                            title: 'Risa Murakami',
                            value: 'risa-murakami'
                        },
                        {
                            title: 'Radha786',
                            value: 'radha7862'
                        }
                    ]
                },
                {
                    name: 'page',
                    title: "页码",
                    type: 'page',
                    value: '0'
                }
            ]
        }
    ]
};
const generateVideoPreviewUrl = (thumbnailUrl)=>`${thumbnailUrl.substring(0, thumbnailUrl.lastIndexOf('/')).replace(/\/thumbs(169)?(xnxx)?((l*)|(poster))\//, '/videopreview/').replace(/(-[0-9]+)_([0-9]+)/, '_$2$1')}_169.mp4`;
const formatUrl = (url)=>{
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return url;
};
const formatXVideosItem = (item)=>{
    const url = formatUrl(item.u);
    const childItem = {
        id: url,
        type: 'url',
        mediaType: 'movie',
        link: url,
        title: lodash_es_unescape(item.tf || item.t),
        backdropPath: item.i,
        previewUrl: generateVideoPreviewUrl(item.i)
    };
    return childItem;
};
async function getNewList(params) {
    try {
        const currentRegion = await getStorageItem('xvideos.region');
        if (currentRegion !== params.region) {
            setStorageItem('xvideos.region', params.region);
            const resp = await Widget.http.get(`${BASE_URL}/change-country/${params.region}`);
            if (resp.headers['set-cookie']) {
                const cookies = resp.headers['set-cookie'].split(';');
                for (const cookie of cookies){
                    const [key, value] = cookie.split('=');
                    if ('session_token' === key) {
                        setStorageItem('xvideos.session_token', value);
                        break;
                    }
                }
            }
        }
    } catch (error) {}
    const page = params.page ? Number.parseInt(params.page) : 0;
    let url = `${BASE_URL}/`;
    if (page > 0) url += `new/${page}`;
    const $ = await widgetAPI.getHtml(url);
    const list = Array.from($('#content .thumb-block:not(.thumb-ad)')).map((el)=>{
        const $el = $(el);
        const $title = $el.find('.title a');
        let link = $title.attr('href');
        if (!link) return null;
        link = formatUrl(link);
        const backdropPath = $el.find('.thumb img').attr('data-src');
        const title = $title.text().trim();
        const result = {
            id: link,
            type: 'url',
            mediaType: 'movie',
            link,
            title,
            backdropPath
        };
        if (backdropPath) result.previewUrl = generateVideoPreviewUrl(backdropPath);
        return result;
    });
    return list.filter((item)=>null !== item);
}
async function getChannelList(params) {
    const page = params.page ? Number.parseInt(params.page) : 0;
    try {
        const resp = await widgetAPI.get(`${BASE_URL}/channels/${params.channel}/videos/best/${page}`);
        const list = resp.videos.map(formatXVideosItem);
        return list;
    } catch (error) {
        console.error("频道视频加载失败", error);
        return [];
    }
}
async function getPornstarsList(params) {
    const page = params.page ? Number.parseInt(params.page) : 0;
    try {
        const resp = await widgetAPI.get(`${BASE_URL}/pornstars/${params.pornstar}/videos/best/${page}`);
        const list = resp.videos.map(formatXVideosItem);
        return list;
    } catch (error) {
        console.error("色情明星视频加载失败", error);
        return [];
    }
}
const VIDEO_URL_KEYWORDS = [
    'html5player.setVideoUrlHigh',
    'html5player.setVideoHLS',
    'html5player.setVideoUrlLow'
];
async function loadDetail(url) {
    try {
        const $ = await widgetAPI.getHtml(url);
        const script = $("script").filter((_, el)=>{
            const text = $(el).text();
            return VIDEO_URL_KEYWORDS.some((keyword)=>text.includes(keyword));
        });
        let videoUrl = '';
        for (const keyword of VIDEO_URL_KEYWORDS){
            var _script_text_match;
            videoUrl = (null == (_script_text_match = script.text().match(new RegExp(`${keyword}\\('(.*?)'`))) ? void 0 : _script_text_match[1]) || '';
            if (videoUrl) break;
        }
        const ldJson = $('script[type="application/ld+json"]').text();
        const ldJsonData = JSON.parse(ldJson);
        videoUrl || (videoUrl = ldJsonData.contentUrl);
        if (!videoUrl) throw new Error("未找到视频资源");
        const result = {
            id: url,
            type: 'detail',
            mediaType: 'movie',
            link: url,
            videoUrl,
            title: ldJsonData.name,
            description: ldJsonData.description,
            backdropPath: ldJsonData.thumbnailUrl[0],
            releaseDate: ldJsonData.uploadDate
        };
        try {
            var _videoRelated_text_match;
            const videoRelated = $("script").filter((_, el)=>{
                const text = $(el).text();
                return text.includes('var video_related=');
            });
            const videoRelatedData = null == (_videoRelated_text_match = videoRelated.text().match(/video_related=\[(.*?)\];/)) ? void 0 : _videoRelated_text_match[1];
            if (videoRelatedData) {
                const videoRelatedList = JSON.parse(`[${videoRelatedData}]`);
                result.childItems = videoRelatedList.map(formatXVideosItem);
            }
        } catch (error) {
            console.error("视频相关视频加载失败", error);
        }
        return result;
    } catch (error) {
        console.error("视频详情加载失败", error);
        return null;
    }
}
;
