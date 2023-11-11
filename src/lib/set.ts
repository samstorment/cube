export function isSuperset<T>(set: Set<T>, subset: Set<T>) {
    for (const elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

export function union<T>(setA: Set<T>, setB: Set<T>) {
    const _union = new Set(setA);
    for (const elem of setB) {
        _union.add(elem);
    }
    return _union;
}

export function intersection<T>(setA: Set<T>, setB: Set<T>, ...sets: Set<T>[]) {
    let _intersection = new Set<T>();
    for (const elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }

    for (const s of sets) {
        _intersection = intersection(s, _intersection);
    }

    return _intersection;
}

export function symmetricDifference<T>(setA: Set<T>, setB: Set<T>) {
    const _difference = new Set(setA);
    for (const elem of setB) {
        if (_difference.has(elem)) {
            _difference.delete(elem);
        } else {
            _difference.add(elem);
        }
    }
    return _difference;
}

export function difference<T>(setA: Set<T>, setB: Set<T>) {
    const _difference = new Set(setA);
    for (const elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}