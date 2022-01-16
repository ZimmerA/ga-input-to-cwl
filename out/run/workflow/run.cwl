class: Workflow
inputs:
  - id: Input1
    type: File
  - id: Input2
    type:
      items: File
      type: array
outputs:
  - id: planemo/out_dir
    type: Directory
requirements:
  - class: MultipleInputFeatureRequirement
cwlVersion: v1.2
steps:
  - id: preprocessing
    in:
      - id: Input1
        source: Input1
      - id: Input2
        source: Input2
    out:
      - paramFile
      - inputDataFolder
    run: ../../workflows/workflow/cwl-galaxy-parser/cwl-galaxy-parser.cwl
  - id: planemo
    in:
      - id: workflowInputParams
        source: preprocessing/paramFile
      - id: inputDataFolder
        source: preprocessing/inputDataFolder
    out:
      - out_dir
    run: ../../workflows/workflow/planemo-run/planemo-run.cwl
