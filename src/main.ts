#! /usr/bin/env node
import * as fs from 'fs'
import { extractGaInputsFromGaFile, writeOutput } from './common'
import { generateJobFile } from './jobFile'
import { generatePreprocessingTool } from './preprocessingTool'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import * as path from 'path'
import { generateWorkflow } from './workflow'
import * as cwlTsAuto from 'cwl-ts-auto'
import { generateRun } from './run'

const optionDefinitions = [
  { name: 'workflowFile', alias: 'i', type: String, defaultOption: true, description: 'Path to the Galaxy workflow file to process' },
  { name: 'runName', alias: 'n', type: String, description: 'Name of the resulting run and workflow (default: name of the .ga file)' },
  { name: 'outFolder', alias: 'o', type: String, defaultValue: './out', description: 'Path to place the results in (default: ./out)' },
  { name: 'help', alias: 'h', type: Boolean, description: 'Prints this dialogue' }
]

const sections = [
  {
    header: 'Galaxy workflow to ARC',
    content: 'Generates an ARC ready CWL workflow and run from a Galaxy workflow(.ga) file'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
]

function main (): void {
  const usage = commandLineUsage(sections)
  const options = commandLineArgs(optionDefinitions)

  if (options.help === true) {
    console.log(usage)
    return
  }

  if (options.workflowFile == null) {
    console.log('Please specify a workflow file')
    return
  }

  if (options.runName == null || options.runName === '') {
    options.runName = path.parse(options.workflowFile).name
  }

  try {
    // Read the Galaxy workflow file
    const gaWorkflowJson = JSON.parse(fs.readFileSync(options.workflowFile).toString())

    // Extract the input descriptions from the Galaxy workflow file
    const gaInputs = extractGaInputsFromGaFile(gaWorkflowJson)

    // Generate the preprocessing cwl tool using the Galaxy input descriptions
    const preprocessingTool = generatePreprocessingTool(gaInputs)
    cwlTsAuto.loadDocument(path.join(__dirname, 'data/tools/planemo-run.cwl')).then((planemoTool) => {
      planemoTool = planemoTool as cwlTsAuto.CommandLineTool

      // generate the run using the Galaxy input descriptions
      const run = generateRun(options.runName, gaInputs)

      const workflow = generateWorkflow(preprocessingTool, planemoTool, gaInputs)
      // generate an example job file
      const jobFileContent = generateJobFile(gaInputs)

      writeOutput(options.outFolder, workflow, run, options.runName, jobFileContent, options.workflowFile)
    }).catch((e) => {
      throw e
    })
  } catch (e) {
    if (e instanceof cwlTsAuto.ValidationException) {
      console.log(e.toString())
    } else {
      console.log(e)
    }
  }
}

main()
