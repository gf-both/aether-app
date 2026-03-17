/* eslint-disable */
// Demo stub — not production-backed
// Meeting recording, transcription, and AI-powered note generation
// Requires:
//   - Web Audio API / MediaRecorder for audio capture
//   - Whisper API (or similar) for speech-to-text transcription
//   - Claude API for note generation, todo extraction, and follow-up suggestions

// ---------------------------------------------------------------------------
// startRecording()
// Captures audio from the user's microphone via the MediaRecorder API.
// Returns a handle that can be passed to stopRecording().
// ---------------------------------------------------------------------------
export async function startRecording() {
  // TODO: Implement real audio capture
  // 1. Request microphone permission with navigator.mediaDevices.getUserMedia({ audio: true })
  // 2. Create a MediaRecorder instance from the stream
  // 3. Collect audio chunks in an array via the ondataavailable handler
  // 4. Call mediaRecorder.start() and return a handle object
  console.log('[meetingRecorder] startRecording called (mock)')

  return {
    id: `rec_${Date.now()}`,
    state: 'recording',
    startedAt: new Date().toISOString(),
    // mediaRecorder and stream would live here in a real implementation
  }
}

// ---------------------------------------------------------------------------
// stopRecording(handle)
// Stops the active recording and returns the raw audio as a Blob.
// ---------------------------------------------------------------------------
export async function stopRecording(handle) {
  // TODO: Implement real recording stop
  // 1. Call mediaRecorder.stop() on the handle
  // 2. Wait for the onstop event to fire
  // 3. Assemble collected chunks into a single Blob({ type: 'audio/webm' })
  // 4. Release the microphone stream tracks
  console.log('[meetingRecorder] stopRecording called (mock)', handle?.id)

  return new Blob(['mock-audio-data'], { type: 'audio/webm' })
}

// ---------------------------------------------------------------------------
// getTranscript(audioBlob)
// Sends recorded audio to a speech-to-text service and returns plain text.
// ---------------------------------------------------------------------------
export async function getTranscript(_audioBlob) {
  // TODO: Implement real transcription
  // 1. Convert the audioBlob to a File or FormData payload
  // 2. POST to the Whisper API endpoint (e.g. https://api.openai.com/v1/audio/transcriptions)
  //    with model: 'whisper-1', the audio file, and optional language hint
  // 3. Parse the JSON response and return the transcript text
  // 4. Handle errors and retry logic for long recordings
  console.log('[meetingRecorder] getTranscript called (mock)')

  return `[Mock transcript - ${new Date().toLocaleTimeString()}]
Facilitator: Welcome everyone. Today we're going to discuss the client's progress and next steps.
Client: I've been feeling much more grounded since our last session. The breathwork exercises really helped.
Facilitator: That's wonderful to hear. Let's explore what specific practices resonated with you.
Client: The morning meditation and the journaling prompts were the most impactful.
Facilitator: Great. I'd like to suggest we add a somatic exercise to your routine. Let's schedule a follow-up in two weeks.`
}

// ---------------------------------------------------------------------------
// generateNotes(transcript)
// Sends the transcript to Claude to produce structured session notes.
// ---------------------------------------------------------------------------
export async function generateNotes(transcript) {
  // TODO: Implement real AI note generation
  // 1. Build a prompt instructing Claude to summarize the session:
  //    - Key themes discussed
  //    - Client observations and breakthroughs
  //    - Practitioner recommendations
  //    - Overall session mood / energy
  // 2. Call the Claude API (Anthropic Messages API) with the prompt + transcript
  // 3. Parse and return the structured notes
  console.log('[meetingRecorder] generateNotes called (mock)')

  return {
    title: 'Session Notes',
    date: new Date().toISOString(),
    summary:
      'Client reported improved grounding since last session. Breathwork, morning meditation, and journaling were identified as the most impactful practices. A somatic exercise was recommended as the next addition to the routine.',
    keyThemes: ['Grounding', 'Breathwork', 'Meditation', 'Journaling'],
    observations:
      'Client shows consistent engagement with prescribed practices and positive self-awareness.',
    recommendations: 'Introduce somatic exercise; schedule follow-up in two weeks.',
    rawTranscript: transcript,
  }
}

// ---------------------------------------------------------------------------
// generateTodos(transcript)
// Extracts actionable to-do items from the transcript using Claude.
// ---------------------------------------------------------------------------
export async function generateTodos(_transcript) {
  // TODO: Implement real AI todo extraction
  // 1. Build a prompt instructing Claude to extract concrete action items:
  //    - Who is responsible (client, practitioner, or both)
  //    - What the action is
  //    - Suggested deadline or priority
  // 2. Call the Claude API with the prompt + transcript
  // 3. Return the structured array of todo objects
  console.log('[meetingRecorder] generateTodos called (mock)')

  return [
    {
      id: `todo_${Date.now()}_1`,
      text: 'Add somatic exercise to daily routine',
      assignee: 'client',
      priority: 'medium',
      dueInDays: 3,
    },
    {
      id: `todo_${Date.now()}_2`,
      text: 'Schedule follow-up session in two weeks',
      assignee: 'practitioner',
      priority: 'high',
      dueInDays: 14,
    },
    {
      id: `todo_${Date.now()}_3`,
      text: 'Continue morning meditation and journaling practice',
      assignee: 'client',
      priority: 'low',
      dueInDays: null,
    },
  ]
}

// ---------------------------------------------------------------------------
// generateFollowUps(transcript)
// Produces suggested follow-up messages from the transcript using Claude.
// ---------------------------------------------------------------------------
export async function generateFollowUps(_transcript) {
  // TODO: Implement real AI follow-up generation
  // 1. Build a prompt instructing Claude to draft follow-up messages:
  //    - Post-session check-in for the client
  //    - Reminder about the next appointment
  //    - Resource links or reading suggestions discussed in session
  // 2. Call the Claude API with the prompt + transcript
  // 3. Return an array of follow-up suggestion objects ready for WhatsApp / email
  console.log('[meetingRecorder] generateFollowUps called (mock)')

  return [
    {
      id: `followup_${Date.now()}_1`,
      type: 'check-in',
      delayDays: 3,
      message:
        'Hi! Just checking in after our session. How are you finding the somatic exercises? Remember, even 5 minutes a day makes a difference.',
    },
    {
      id: `followup_${Date.now()}_2`,
      type: 'reminder',
      delayDays: 12,
      message:
        'Friendly reminder: we have a follow-up session scheduled in 2 days. Looking forward to hearing about your progress!',
    },
    {
      id: `followup_${Date.now()}_3`,
      type: 'resource',
      delayDays: 1,
      message:
        'Here are the somatic exercise resources we discussed today. Start with the grounding sequence and work up to the full flow when you feel ready.',
    },
  ]
}
