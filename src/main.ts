import * as fs from 'fs'
import * as cwlTsAuto from 'cwl-ts-auto'

interface GAInputType {
  name: string
  type: string
}

const inputTypes = ['data_input', 'data_collection_input']

function extractGaInputs (gaFile: any): GAInputType[] {
  const gaInputs: GAInputType[] = []

  for (const input in gaFile.steps) {
    const step = gaFile.steps[input]
    const stepType = step.type
    if (inputTypes.includes(stepType)) {
      gaInputs.push({ name: step.label, type: stepType })
    }
  }
  return gaInputs
}

function mapGaTypeToCommandInputParameterType (gaType: string): cwlTsAuto.CommandInputParameterProperties['type'] {
  switch (gaType) {
    case 'data_input': {
      return cwlTsAuto.CWLType.FILE
    }
    case 'data_collection_input': {
      return new cwlTsAuto.CommandInputArraySchema({ items: cwlTsAuto.CWLType.FILE, type: cwlTsAuto.enum_d062602be0b4b8fd33e69e29a841317b6ab665bc.ARRAY })
    }
    default: {
      throw Error('Invalid input type: ' + gaType)
    }
  }
}

function createCommandInputParameter (input: GAInputType): cwlTsAuto.CommandInputParameter {
  return new cwlTsAuto.CommandInputParameter({
    inputBinding: new cwlTsAuto.CommandLineBinding({ prefix: '--file ' + input.name, shellQuote: false }),
    label: input.name,
    type: mapGaTypeToCommandInputParameterType(input.type)
  })
}

function generatePreprocessingStepSkeleton (): cwlTsAuto.CommandLineTool {
  const preprocessingStepSkeleton = new cwlTsAuto.CommandLineTool({
    baseCommand: 'cwl-galaxy-parser',
    cwlVersion: cwlTsAuto.CWLVersion.V1_2,
    requirements: [
      new cwlTsAuto.InlineJavascriptRequirement({}),
      new cwlTsAuto.ShellCommandRequirement({}),
      new cwlTsAuto.DockerRequirement({ dockerImageId: 'cwl-galaxy-parser', dockerFile: '$include: ./Dockerfile' })
    ],
    inputs: [],
    outputs: []
  })

  const paramFileOuput = new cwlTsAuto.CommandOutputParameter({
    type: cwlTsAuto.CWLType.FILE,
    label: 'paramFile',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)/galaxyInput.yml' })
  })

  const inputDatFolderOuput = new cwlTsAuto.CommandOutputParameter({
    type: cwlTsAuto.CWLType.DIRECTORY,
    label: 'inputDataFolder',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)' })
  })
  preprocessingStepSkeleton.outputs.push(paramFileOuput)
  preprocessingStepSkeleton.outputs.push(inputDatFolderOuput)
  return preprocessingStepSkeleton
}

function generatePreprocessingStep (gaInputs: GAInputType[]): cwlTsAuto.CommandLineTool {
  const preprocessingStep = generatePreprocessingStepSkeleton()

  for (const input of gaInputs) {
    preprocessingStep.inputs.push(createCommandInputParameter(input))
  }

  return preprocessingStep
}

function main (): void {
  // Read the galaxy Workflow file
  const gaWorkflowJson = JSON.parse(fs.readFileSync(process.argv[2]).toString())

  // Extract the input descriptions from the galaxy workflow
  const gaInputs = extractGaInputs(gaWorkflowJson)

  // Generate the cwl tool using the galaxy input descriptions
  const preprocessingStep = generatePreprocessingStep(gaInputs)

  // Print out the resulting cwl
  console.log(JSON.stringify(preprocessingStep.save(), null, 4))
}

main()
