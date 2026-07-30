
export default {
  process(src) {
    const processedCode = 'module.exports = ' + JSON.stringify(src) + ';';
    return {
      code: processedCode,
    };
  },
};
