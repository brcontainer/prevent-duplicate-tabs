/*
 * Prevent Duplicate Tabs
 * Copyright (c) 2023 Guilherme Nascimento (brcontainer@yahoo.com.br)
 * Released under the MIT license
 *
 * https://github.com/brcontainer/prevent-duplicate-tabs
 */

var supported = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

function base(data, format, transform) {
    return new Promise((resolve, reject) => {
        var stream;

        if (data instanceof Blob) {
            stream = data.stream();
        } else if (data instanceof Response) {
            stream = data.body;
        } else {
            stream = new Response(data).body;
        }

        data = null;

        var blob = new Response(stream.pipeThrough(
            new transform(format)
        )).blob();

        resolve(blob);

        stream = null;
    });
}

function compress(data, format) {
    return base(data, format, CompressionStream);
}

function decompress(data, format) {
    return base(data, format, DecompressionStream);
}

export {
    compress,
    decompress,
    supported
};
