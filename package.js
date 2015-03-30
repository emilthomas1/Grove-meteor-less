Package.describe({
  name: "grove:less",
  summary: "Import all of your Less files in one step, in the order you want",
  version: "0.1.0"
});

Package.registerBuildPlugin({
  name: 'less-build-plugin',
  use: [],
  sources: [
    'plugin.js',
  ],
  npmDependencies: {
    "less": "2.4.0",
    "less-plugin-autoprefix": "1.4.1"
  }
});

Package.onTest(function (api) {
  api.use(['grove:less',
           'practicalmeteor:munit',
           'templating'
          ]);
  api.addFiles(['tests/foo.html',
                'tests/foo.less',
                'tests/tests.js',
                ], 'client');
});