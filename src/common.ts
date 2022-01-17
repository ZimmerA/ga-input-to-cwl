import * as cwlTsAuto from 'cwl-ts-auto'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

export interface GAInputType {
  name: string
  type: string
}

export const inputTypes = ['data_input', 'data_collection_input', 'text', 'boolean', 'float', 'integer', 'color']

export function extractGaInputsFromGaFile (gaFile: any): GAInputType[] {
  const gaInputs: GAInputType[] = []

  for (const input in gaFile.steps) {
    const step = gaFile.steps[input]
    let stepType: string = step.type

    if (stepType === 'parameter_input') {
      stepType = JSON.parse(step.tool_state).parameter_type
    }

    if (inputTypes.includes(stepType)) {
      if (step.label == null) {
        throw Error('Unnamed input detected, aborting. Please speficy a label for all inputs!')
      }
      gaInputs.push({ name: step.label, type: stepType })
    }
  }
  return gaInputs
}

export function mapGaTypeToCommandInputParameterType (gaType: string): cwlTsAuto.CommandInputParameterProperties['type'] {
  switch (gaType) {
    case 'data_input': {
      return cwlTsAuto.CWLType.FILE
    }
    case 'data_collection_input': {
      return new cwlTsAuto.CommandInputArraySchema({ items: cwlTsAuto.CWLType.FILE, type: cwlTsAuto.enum_d062602be0b4b8fd33e69e29a841317b6ab665bc.ARRAY })
    }
    case 'text': {
      return cwlTsAuto.PrimitiveType.STRING
    }
    case 'boolean': {
      return cwlTsAuto.PrimitiveType.BOOLEAN
    }
    case 'float': {
      return cwlTsAuto.PrimitiveType.FLOAT
    }
    case 'integer': {
      return cwlTsAuto.PrimitiveType.INT
    }
    default: {
      throw Error('Input type not supported: ' + gaType)
    }
  }
}

export function createWorkflowInputParameterFromGaInput (input: GAInputType): cwlTsAuto.WorkflowInputParameter {
  return new cwlTsAuto.WorkflowInputParameter({
    id: input.name,
    type: mapGaTypeToCommandInputParameterType(input.type)
  })
}

export function ensureDirectoryExists (filePath: string): void {
  const dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return
  }
  ensureDirectoryExists(dirname)
  fs.mkdirSync(dirname)
}

export function copyDir (src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    entry.isDirectory()
      ? copyDir(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath)
  }
}

export function writeOutput (outFolder: string, runName: string, preprocessingTool: cwlTsAuto.CommandLineTool, run: cwlTsAuto.Workflow, jobFileContent: string, gaFilePath: string): void {
  ensureDirectoryExists(path.join(outFolder, 'workflows', runName, 'cwl-galaxy-parser/cwl-galaxy-parser.cwl'))
  fs.writeFileSync(path.join(outFolder, 'workflows', runName, '/cwl-galaxy-parser/cwl-galaxy-parser.cwl'), yaml.dump(preprocessingTool.save()))
  copyDir('data/cwl-galaxy-parser', path.join(outFolder, 'workflows', runName, '/cwl-galaxy-parser'))
  copyDir('data/planemo-run', path.join(outFolder, 'workflows', runName, 'planemo-run'))
  fs.copyFileSync(gaFilePath, path.join(outFolder, 'workflows', runName, 'planemo-run/') + path.parse(gaFilePath).base)

  ensureDirectoryExists(path.join(outFolder, 'run', runName, 'run.cwl'))
  fs.writeFileSync(path.join(outFolder, 'run', runName, 'run.cwl'), yaml.dump(run.save()))
  fs.writeFileSync(path.join(outFolder, 'run', runName, '/run.yml'), jobFileContent)
}
