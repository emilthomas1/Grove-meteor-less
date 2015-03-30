var fs   = Npm.require('fs');
var less = Npm.require('less');
var LessPluginAutoPrefix = Npm.require('less-plugin-autoprefix');

var DEFAULT_INDEX_FILE_PATH = "./client/main.less";
var OPTIONS_FILE = "config/less.json";

var generatedMessage = [
  "// This file is auto generated by the grove:less package",
  "// New .less files will be automatically imported  at the bottom",
  "// Existing contents will not be touched",
  "// When you delete a less file you must manually delete the import from here as well",
  "",
  ""
].join("\n");

var loadJSONFile = function (compileStep, filePath) {
  try {
    return JSON.parse( fs.readFileSync(filePath) );
  } catch (e) {
    compileStep.error({
      message: "Failed to parse " + filePath + " as JSON"
    });
    return {};
  }
};


Plugin.registerSourceHandler("less", {archMatching: 'web'}, function (compileStep) {
  // Reading in user configuration
  var config = {};
  if ( fs.existsSync(OPTIONS_FILE) ) {
    config = loadJSONFile(compileStep, OPTIONS_FILE);
  }

  // Load order setup
  if ( config.useIndex ) {
    var indexFilePath = config.indexFilePath || DEFAULT_INDEX_FILE_PATH;
    // If this isn't the index file, add it to the index if need be
    if ( compileStep.inputPath != indexFilePath ) {
      if ( fs.existsSync(indexFilePath) ) {
        var lessIndex = fs.readFileSync(indexFilePath, 'utf8');
        if ( lessIndex.indexOf(compileStep.inputPath) == -1 ) {
          fs.appendFileSync(indexFilePath, '\n@import "' + compileStep.inputPath + '";', 'utf8');
        }
      } else {
        var newFile = generatedMessage + '@import "' + compileStep.inputPath + '";\n';
        fs.writeFileSync(indexFilePath, newFile, 'utf8');
      }
      return; // stop here, only compile the index file
    }
  }

  // Autoprefixing setup
  var autoprefixer;
  if ( config.enableAutoprefixer ) {
    if ( config.autoprefixerOptions ) {
      autoprefixer = new LessPluginAutoPrefix(config.autoprefixerOptions);
    } else {
      autoprefixer = new LessPluginAutoPrefix();
    }
  }
  plugins = [];
  if (autoprefixer) plugins.push(autoprefixer);


  // Compiler options
  var options = {
    syncImport: true,
    paths: config.includePaths || [],
    plugins: plugins
  };

  var source = compileStep.read().toString('utf8');
  less.render(source, options, function(error, output) {
    if (error) {
      compileStep.error({
        message: "Less compiler error: " + error.message,
        sourcePath: error.filename || compileStep.inputPath,
        line: error.line,
        column: error.column
      });
    } else {
      compileStep.addStylesheet({
        path: compileStep.inputPath + ".css",
        data: output.css,
        sourceMap: output.map
      });
    }
  });

});
