import * as fs from 'fs'
import * as cwlTsAuto from 'cwl-ts-auto'

interface GAInputType {
  name: string
  type: string
}

const inputTypes = ['data_input', 'data_collection_input']

function main (): void {
  // Read Ga file
  const gaWorkflowJson = JSON.parse(fs.readFileSync(process.argv[2]).toString())

  // Specify inputs
  const gaInputs: GAInputType[] = []

  for (const input in gaWorkflowJson.steps) {
    const step = gaWorkflowJson.steps[input]
    const stepType = step.type
    if (inputTypes.includes(stepType)) {
      gaInputs.push({ name: step.label, type: stepType })
    }
  }

  // generate preprocessing step
  const preprocessingStep =
  new cwlTsAuto.CommandLineTool({
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

  for (const input of gaInputs) {
    let type: any
    if (input.type === 'data_input') {
      type = cwlTsAuto.CWLType.FILE
    } else if (input.type === 'data_collection_input') {
      type = new cwlTsAuto.CommandInputArraySchema({ items: cwlTsAuto.CWLType.FILE, type: cwlTsAuto.enum_d062602be0b4b8fd33e69e29a841317b6ab665bc.ARRAY })
    }
    const exampleInput =
    new cwlTsAuto.CommandInputParameter({
      inputBinding: new cwlTsAuto.CommandLineBinding({ prefix: '--file ' + input.name, shellQuote: false }),
      label: input.name,
      type: type
    })
    preprocessingStep.inputs.push(exampleInput)
  }

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
  preprocessingStep.outputs.push(paramFileOuput)
  preprocessingStep.outputs.push(inputDatFolderOuput)

  console.log(JSON.stringify(preprocessingStep.save(), null, 4))
}

main()
