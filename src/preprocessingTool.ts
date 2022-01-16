import * as cwlTsAuto from 'cwl-ts-auto'
import { GAInputType, mapGaTypeToCommandInputParameterType } from './common'

function createCommandInputParameter (input: GAInputType): cwlTsAuto.CommandInputParameter {
  return new cwlTsAuto.CommandInputParameter({
    inputBinding: new cwlTsAuto.CommandLineBinding({ prefix: '--file ' + input.name, shellQuote: false }),
    id: input.name,
    type: mapGaTypeToCommandInputParameterType(input.type)
  })
}

function generatePreprocessingToolSkeleton (): cwlTsAuto.CommandLineTool {
  const preprocessingToolSkeleton = new cwlTsAuto.CommandLineTool({
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
    id: 'paramFile',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)/galaxyInput.yml' })
  })

  const inputDatFolderOuput = new cwlTsAuto.CommandOutputParameter({
    type: cwlTsAuto.CWLType.DIRECTORY,
    id: 'inputDataFolder',
    outputBinding: new cwlTsAuto.CommandOutputBinding({ glob: '$(runtime.outdir)' })
  })
  preprocessingToolSkeleton.outputs.push(paramFileOuput)
  preprocessingToolSkeleton.outputs.push(inputDatFolderOuput)
  return preprocessingToolSkeleton
}

export function generatePreprocessingTool (gaInputs: GAInputType[]): cwlTsAuto.CommandLineTool {
  const preprocessingTool = generatePreprocessingToolSkeleton()

  for (const input of gaInputs) {
    preprocessingTool.inputs.push(createCommandInputParameter(input))
  }

  return preprocessingTool
}
