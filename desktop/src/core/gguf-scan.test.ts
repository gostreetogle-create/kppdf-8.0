import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GGUF_MAX_SIZE_BYTES,
  GGUF_MIN_SIZE_BYTES,
  isGgufMagic,
  scanGgufModels,
  type GgufScanIo,
} from './gguf-scan';

const GGUF_MAGIC = new Uint8Array([0x47, 0x47, 0x55, 0x46]);
const BAD_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // ZIP local file header

function mockIo(files: Record<string, { size: number; head: Uint8Array }>): GgufScanIo {
  return {
    listFileNames: async (dir) => {
      assert.equal(dir, 'C:\\models');
      return Object.keys(files);
    },
    join: async (...parts) => parts.join('\\'),
    statSize: async (path) => {
      const name = path.split('\\').pop()!;
      const entry = files[name];
      if (!entry) throw new Error('not found');
      return entry.size;
    },
    readHead: async (path) => {
      const name = path.split('\\').pop()!;
      const entry = files[name];
      if (!entry) throw new Error('not found');
      return entry.head;
    },
  };
}

test('isGgufMagic принимает "GGUF" и отклоняет короткий/чужой заголовок', () => {
  assert.equal(isGgufMagic(GGUF_MAGIC), true);
  assert.equal(isGgufMagic(BAD_MAGIC), false);
  assert.equal(isGgufMagic(new Uint8Array([0x47, 0x47])), false);
});

test('scanGgufModels находит валидный .gguf с любым именем', async () => {
  const io = mockIo({
    'my-model-from-flash-drive.gguf': { size: 2_000_000_000, head: GGUF_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.equal(result.models.length, 1);
  assert.equal(result.models[0].fileName, 'my-model-from-flash-drive.gguf');
  assert.equal(result.models[0].sizeBytes, 2_000_000_000);
  assert.equal(result.rejected.length, 0);
});

test('scanGgufModels игнорирует файлы без расширения .gguf', async () => {
  const io = mockIo({
    'readme.txt': { size: 2_000_000_000, head: GGUF_MAGIC },
    'model.GGUF': { size: 2_000_000_000, head: GGUF_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.equal(result.models.length, 1);
  assert.equal(result.models[0].fileName, 'model.GGUF');
  assert.equal(result.rejected.length, 0);
});

test('scanGgufModels отклоняет файл меньше 200 МБ с RU-причиной', async () => {
  const io = mockIo({
    'tiny.gguf': { size: GGUF_MIN_SIZE_BYTES - 1, head: GGUF_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.equal(result.models.length, 0);
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0].reason, /200 МБ/);
});

test('scanGgufModels отклоняет файл больше 20 ГБ с RU-причиной', async () => {
  const io = mockIo({
    'huge.gguf': { size: GGUF_MAX_SIZE_BYTES + 1, head: GGUF_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.equal(result.models.length, 0);
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0].reason, /20 ГБ/);
});

test('scanGgufModels отклоняет файл без magic-байт GGUF (мусор/ярлык)', async () => {
  const io = mockIo({
    'renamed.gguf': { size: 2_000_000_000, head: BAD_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.equal(result.models.length, 0);
  assert.equal(result.rejected.length, 1);
  assert.match(result.rejected[0].reason, /GGUF/);
});

test('scanGgufModels сортирует найденные модели по имени', async () => {
  const io = mockIo({
    'zeta.gguf': { size: 2_000_000_000, head: GGUF_MAGIC },
    'alpha.gguf': { size: 2_000_000_000, head: GGUF_MAGIC },
  });
  const result = await scanGgufModels('C:\\models', io);
  assert.deepEqual(
    result.models.map((m) => m.fileName),
    ['alpha.gguf', 'zeta.gguf'],
  );
});

test('scanGgufModels не бросает и продолжает список, если один файл не читается', async () => {
  const io = mockIo({
    'good.gguf': { size: 2_000_000_000, head: GGUF_MAGIC },
  });
  const flaky: GgufScanIo = {
    ...io,
    statSize: async (path) => {
      if (path.endsWith('broken.gguf')) throw new Error('EACCES');
      return io.statSize(path);
    },
    listFileNames: async () => ['good.gguf', 'broken.gguf'],
  };
  const result = await scanGgufModels('C:\\models', flaky);
  assert.equal(result.models.length, 1);
  assert.equal(result.models[0].fileName, 'good.gguf');
  assert.equal(result.rejected.length, 1);
  assert.equal(result.rejected[0].fileName, 'broken.gguf');
});
