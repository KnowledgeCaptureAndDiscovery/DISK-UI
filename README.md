
# DISK User Interface (UI) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.10651268.svg)](https://doi.org/10.5281/zenodo.10651268)

The [DISK](https://disk.isi.edu) system automates the execution of scientific workflows triggered 
on data changes. To do this [DISK](https://disk.isi.edu) collects data from different data repositories
and defines methods on different workflows systems. User defined goals are 
periodically check for new data/methods available. When a method detects new data,
a new workflow execution will be send. Each experiment execution is stored with its
metadata and outputs for posterior analysis.

## Documentation and Links

- Full documentation is available at [https://disk.readthedocs.io](https://disk.readthedocs.io)
- The project website is available at [https://disk-project.org/index.html](https://disk-project.org/index.html)
- Check our our ENIGMA DISK live demo at [https://disk.isi.edu](https://disk.isi.edu)

## Related repositories

- [DISK API](https://github.com/KnowledgeCaptureAndDiscovery/DISK-API) is the backend of this application.
You need to install the backend if you want to run the DISK UI locally.
- We use [WINGS](https://github.com/KnowledgeCaptureAndDiscovery/WINGS) as the workflow manager for the DISK runs.

## How to install?

```bash
$ yarn install
$ yarn start
```

## How to configure?

To configure the [DISK](https://disk.isi.edu) UI, you need to create a `config.js` file in the public folder.

```bash
$ vim public/config.js
```

### Configuration parameters

- `window.REACT_APP_DISK_API`: URL of the DISK API
