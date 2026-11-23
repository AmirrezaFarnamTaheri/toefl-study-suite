$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
  $inventory = @'
const fs = require("node:fs");
const vm = require("node:vm");
const load = (name, key) => vm.runInNewContext(fs.readFileSync(name, "utf8") + "\n" + key);
const rows = load("data/listening-practice.js", "TOEFL_LISTENING_PRACTICE").map(({ id, script }) => ({ name: id, script }));
for (const mock of load("data/toefl-full-mocks.js", "TOEFL_FULL_MOCKS").mocks) {
  for (const [phase, key] of [["listening1", "module1"], ["listening2", "module2"]]) {
    mock.listening[key].items.forEach(({ script }, index) => rows.push({ name: mock.id + "-" + phase + "-" + index, script }));
  }
}
process.stdout.write(JSON.stringify(rows));
'@
  $OutputEncoding = [Text.UTF8Encoding]::new()
  [Console]::OutputEncoding = $OutputEncoding
  $clips = ($inventory | node -) | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or !$clips) { throw 'Audio scripts could not be loaded' }
  $out = [IO.Directory]::CreateDirectory((Join-Path (Get-Location) 'assets/audio/prompts'))
  $format = [System.Speech.AudioFormat.SpeechAudioFormatInfo]::new(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Eight, [System.Speech.AudioFormat.AudioChannel]::Mono)
  $synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
  try {
    foreach ($clip in $clips) {
      if ($clip.name -notmatch '^[a-z0-9-]+$' -or [string]::IsNullOrWhiteSpace($clip.script)) { throw "Invalid audio entry $($clip.name)" }
      $prompt = [System.Speech.Synthesis.PromptBuilder]::new([Globalization.CultureInfo]::GetCultureInfo('en-US'))
      $scriptText = $clip.script.Trim()
      $turns = [regex]::Matches($scriptText, '(?m)^(?<speaker>[A-Za-z][A-Za-z ]{0,28}):\s*')
      $voices = @{}
      if ($turns.Count -ge 2) {
        if ($turns[0].Index -gt 0) { $prompt.AppendText($scriptText.Substring(0,$turns[0].Index).Trim()) }
        for ($i = 0; $i -lt $turns.Count; $i++) {
          $label = $turns[$i].Groups['speaker'].Value
          if (!$voices.ContainsKey($label)) {
            $voices[$label] = if ($label -eq 'Man' -or ($label -ne 'Woman' -and $voices.Count % 2 -eq 1)) { 'Microsoft David Desktop' } else { 'Microsoft Zira Desktop' }
          }
          $start = $turns[$i].Index + $turns[$i].Length
          $end = if ($i + 1 -lt $turns.Count) { $turns[$i + 1].Index } else { $scriptText.Length }
          $prompt.StartVoice($voices[$label])
          $prompt.AppendText(($scriptText.Substring($start, $end - $start) -replace '\s+', ' ').Trim())
          $prompt.EndVoice()
          $prompt.AppendBreak([TimeSpan]::FromMilliseconds(220))
        }
      } else {
        $synth.SelectVoice('Microsoft David Desktop')
        $prompt.AppendText(($scriptText -replace '\s+', ' '))
      }
      $synth.SetOutputToWaveFile((Join-Path $out.FullName ($clip.name + '.wav')), $format)
      try { $synth.Speak($prompt) } finally { $synth.SetOutputToNull() }
    }
    Write-Output "Recorded $($clips.Count) device-voice prompts."
  } finally { $synth.Dispose() }
} finally { Pop-Location }

