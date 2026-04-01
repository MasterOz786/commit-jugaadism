/**
 * OpenRouter model ids that match typical Cursor “OpenRouter” free / fast picks.
 * Set OPENROUTER_MODEL to any of these (or any id from https://openrouter.ai/models).
 */
export const OPENROUTER_MODEL_PRESETS = {
  stepfunFlash: 'stepfun/step-3.5-flash:free',
  nemotronSuper: 'nvidia/nemotron-3-super-120b-a12b:free',
  qwenNextInstructFree: 'qwen/qwen3-next-80b-a3b-instruct:free',
  nemotronNano: 'nvidia/nemotron-3-nano-30b-a3b:free',
  minimaxM25Free: 'minimax/minimax-m2.5:free',
};

/** Default when OPENROUTER_MODEL is unset */
export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODEL_PRESETS.stepfunFlash;
