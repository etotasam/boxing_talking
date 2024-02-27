
export default {
  process(src, filename, config, options) {
    const processedCode = 'module.exports = ' + JSON.stringify(src) + ';';
    return {
      code: processedCode,
    };
  },
};