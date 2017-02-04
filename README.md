[![Build Status](https://travis-ci.org/fmilani/contatempo.svg?branch=master)](https://travis-ci.org/fmilani/contatempo)
# Contatempo

A simple time tracker
### Contributing

#### Running tests

Create a `settings.coverage.json` file with the following content:

```
{
    "coverage": {
        "coverage_app_folder": "<absolute_path_to_project_root_folder>/",
        "is_coverage_active": true,
        "verbose": false
    }
}
```

Notice that `coverage_app_folder` ends with a `slash (/)`. This is needed in order to make coverage report work.

After you've created the file, you can just run `npm tdd`.
