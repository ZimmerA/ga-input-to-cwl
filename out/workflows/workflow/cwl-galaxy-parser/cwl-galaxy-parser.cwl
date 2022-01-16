class: CommandLineTool
inputs:
  - id: Input1
    type: File
    inputBinding:
      prefix: '--file Input1'
      shellQuote: false
  - id: Input2
    type:
      items: File
      type: array
    inputBinding:
      prefix: '--file Input2'
      shellQuote: false
outputs:
  - id: paramFile
    type: File
    outputBinding:
      glob: $(runtime.outdir)/galaxyInput.yml
  - id: inputDataFolder
    type: Directory
    outputBinding:
      glob: $(runtime.outdir)
requirements:
  - class: InlineJavascriptRequirement
  - class: ShellCommandRequirement
  - class: DockerRequirement
    dockerFile: '$include: ./Dockerfile'
    dockerImageId: cwl-galaxy-parser
cwlVersion: v1.2
baseCommand: cwl-galaxy-parser
