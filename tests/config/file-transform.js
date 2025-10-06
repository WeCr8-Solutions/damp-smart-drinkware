import path from 'path';

export default {
  process(_unused, sourcePath) {
    return {
      code: `export default ${JSON.stringify(path.basename(sourcePath))};`,
    };
  },
  getCacheKey() {
    return 'fileTransform';
  },
};