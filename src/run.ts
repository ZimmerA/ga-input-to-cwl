import * as cwlTsAuto from 'cwl-ts-auto'
import { createWorkflowInputParameterFromGaInput, GAInputType } from './common'
import * as path from 'path'

function generatePreprocessingStepSkeleton (runName: string): cwlTsAuto.WorkflowStep {
  const preprocessingStepSkeleton = new cwlTsAuto.WorkflowStep({ id: 'preprocessing', in_: [], out: [], run: path.join('../../workflows', runName, 'cwl-galaxy-parser/cwl-galaxy-parser.cwl') })
  const outParamFile = 'paramFile'
  const outInputDataFolder = 'inputDataFolder'
  preprocessingStepSkeleton.out.push(outParamFile, outInputDataFolder)
  return preprocessingStepSkeleton
}

function generatePreprocessingStep (runName: string, gaInputs: GAInputType[]): cwlTsAuto.WorkflowStep {
  const preprocessingStep = generatePreprocessingStepSkeleton(runName)
  for (const input of gaInputs) {
    const stepInput = new cwlTsAuto.WorkflowStepInput({})
    stepInput.id = input.name
    stepInput.source = input.name
    preprocessingStep.in_.push(stepInput)
  }
  return preprocessingStep
}

function generatePlanemoStep (runName: string): cwlTsAuto.WorkflowStep {
  const planemoStep = new cwlTsAuto.WorkflowStep({ id: 'planemo', in_: [], out: [], run: path.join('../../workflows', runName, 'planemo-run/planemo-run.cwl') })
  const workflowInputParams = new cwlTsAuto.WorkflowStepInput({ id: 'workflowInputParams', source: 'preprocessing/paramFile' })
  const inputDataFolder = new cwlTsAuto.WorkflowStepInput({ id: 'inputDataFolder', source: 'preprocessing/inputDataFolder' })
  planemoStep.in_.push(workflowInputParams, inputDataFolder)

  const outDir = 'out_dir'
  planemoStep.out.push(outDir)
  return planemoStep
}

function generateRunSkeleton (): cwlTsAuto.Workflow {
  const run = new cwlTsAuto.Workflow({
    cwlVersion: cwlTsAuto.CWLVersion.V1_2,
    requirements: [new cwlTsAuto.MultipleInputFeatureRequirement({})],
    inputs: [],
    outputs: [],
    steps: []
  })
  const output = new cwlTsAuto.WorkflowOutputParameter({ type: cwlTsAuto.CWLType.DIRECTORY, id: 'planemo/out_dir' })
  run.outputs.push(output)
  return run
}

export function generateRun (runName: string, gaInputs: GAInputType[]): cwlTsAuto.Workflow {
  const run = generateRunSkeleton()

  for (const input of gaInputs) {
    run.inputs.push(createWorkflowInputParameterFromGaInput(input))
  }

  const preprocessingStep = generatePreprocessingStep(runName, gaInputs)
  run.steps.push(preprocessingStep)
  const planemoStep = generatePlanemoStep(runName)
  run.steps.push(planemoStep)
  return run
}
