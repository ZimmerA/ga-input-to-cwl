# ga-input-to-cwl
Reads .ga files to generate a cwl tool wrapper with the same inputs as the ga file

## Usage
Execute `npm install && npm run build` to install dependencies and build the tool. Run `npm run start --silent data/workflow.ga > preprocessing.json` to generate the preprocessing step from the workflow.ga file.