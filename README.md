# galaxy-workflow-to-arc
[![npm version](https://badge.fury.io/js/galaxy-workflow-to-arc.svg)](https://badge.fury.io/js/galaxy-workflow-to-arc)
Generates an ARC ready CWL workflow and run from a Galaxy workflow(.ga) file 

## Installation
To use galaxy-workflow-to-arc, make sure node.js is installed. Then execute:

`npm i -g galaxy-workflow-to-arc`
## Usage:
```
Galaxy workflow to ARC

  Generates an ARC ready CWL workflow and run from a Galaxy workflow(.ga) file 

Options

  -i, --workflowFile string   Path to the Galaxy workflow file to process       
  -n, --runName string        Name of the resulting run and workflow (default:  
                              name of the .ga file)                             
  -o, --outFolder string      Path to place the results in (default: ./out)     
  -h, --help                  Prints this dialogue      
```