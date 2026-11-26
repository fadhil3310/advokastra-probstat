export const EMPTY_ANALYSIS_CONFIG = {
  domains: {
    prodi: [],
    angkatan: [],
    kategori: [],
    urgensi: [],
    status: [],
  },
  variableOptions: [],
  confidenceLevels: [],
  alphaOptions: [],
  semantics: {
    pendingStatus: '',
    inProgressStatus: '',
    completedStatus: '',
    highUrgency: '',
  },
  defaults: {
    overviewField: '',
    proportionField: '',
    proportionTarget: '',
    confidenceLevel: null,
    chiSquareRowField: '',
    chiSquareColField: '',
    alpha: null,
    regressionPredictAhead: null,
    poissonTargetX: null,
    datasetPageSize: null,
  },
};

export function normalizeAnalysisConfig(rawConfig = {}) {
  const rawDomains = rawConfig.domains ?? {};
  const domains = Object.fromEntries(
    Object.keys(EMPTY_ANALYSIS_CONFIG.domains).map((field) => [
      field,
      Array.isArray(rawDomains[field]) ? rawDomains[field].map(String) : [],
    ])
  );

  const variableOptions = Array.isArray(rawConfig.variableOptions)
    ? rawConfig.variableOptions
        .filter((option) => option?.value && option?.label)
        .map((option) => ({
          value: String(option.value),
          label: String(option.label),
        }))
    : [];

  const normalizeNumericOptions = (options) =>
    Array.isArray(options)
      ? options
          .map((option) => ({
            value: Number(option?.value),
            label: option?.label === undefined ? null : String(option.label),
          }))
          .filter((option) => Number.isFinite(option.value))
      : [];

  const rawSemantics = rawConfig.semantics ?? {};
  const semantics = Object.fromEntries(
    Object.keys(EMPTY_ANALYSIS_CONFIG.semantics).map((key) => [
      key,
      String(rawSemantics[key] ?? ''),
    ])
  );

  const rawDefaults = rawConfig.defaults ?? {};
  const numericDefaultKeys = new Set([
    'confidenceLevel',
    'alpha',
    'regressionPredictAhead',
    'poissonTargetX',
    'datasetPageSize',
  ]);
  const defaults = Object.fromEntries(
    Object.keys(EMPTY_ANALYSIS_CONFIG.defaults).map((key) => {
      if (numericDefaultKeys.has(key)) {
        const value = Number(rawDefaults[key]);
        return [key, Number.isFinite(value) ? value : null];
      }
      return [key, String(rawDefaults[key] ?? '')];
    })
  );

  return {
    domains,
    variableOptions,
    confidenceLevels: normalizeNumericOptions(rawConfig.confidenceLevels),
    alphaOptions: normalizeNumericOptions(rawConfig.alphaOptions),
    semantics,
    defaults,
  };
}

export function validateAnalysisConfig(config) {
  const missingDomains = Object.entries(config.domains)
    .filter(([, values]) => values.length === 0)
    .map(([field]) => field);
  if (missingDomains.length > 0) {
    throw new Error(`Domain analisis kosong: ${missingDomains.join(', ')}.`);
  }

  if (config.variableOptions.length === 0) {
    throw new Error('variableOptions pada app_config/analysis tidak boleh kosong.');
  }
  if (config.confidenceLevels.length === 0 || config.alphaOptions.length === 0) {
    throw new Error('confidenceLevels dan alphaOptions wajib tersedia di app_config/analysis.');
  }

  const missingSemantics = Object.entries(config.semantics)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingSemantics.length > 0) {
    throw new Error(`Semantik domain belum lengkap: ${missingSemantics.join(', ')}.`);
  }

  const { pendingStatus, inProgressStatus, completedStatus, highUrgency } =
    config.semantics;
  for (const status of [pendingStatus, inProgressStatus, completedStatus]) {
    if (!config.domains.status.includes(status)) {
      throw new Error(`Semantik status "${status}" tidak ditemukan pada domains.status.`);
    }
  }
  if (!config.domains.urgensi.includes(highUrgency)) {
    throw new Error(`Semantik urgensi "${highUrgency}" tidak ditemukan pada domains.urgensi.`);
  }

  const variableFields = config.variableOptions.map((option) => option.value);
  const requiredVariableDefaults = [
    config.defaults.overviewField,
    config.defaults.proportionField,
    config.defaults.chiSquareRowField,
    config.defaults.chiSquareColField,
  ];
  if (requiredVariableDefaults.some((field) => !variableFields.includes(field))) {
    throw new Error('Default variabel analisis harus merujuk ke variableOptions yang tersedia.');
  }
  if (config.defaults.chiSquareRowField === config.defaults.chiSquareColField) {
    throw new Error('Default variabel baris dan kolom Chi-Square harus berbeda.');
  }

  const targetDomain = config.domains[config.defaults.proportionField] ?? [];
  if (!targetDomain.includes(config.defaults.proportionTarget)) {
    throw new Error('Default target proporsi tidak ditemukan pada domain variabelnya.');
  }
  if (
    !config.confidenceLevels.some(
      (option) => option.value === config.defaults.confidenceLevel
    )
  ) {
    throw new Error('Default confidenceLevel tidak ditemukan pada confidenceLevels.');
  }
  if (!config.alphaOptions.some((option) => option.value === config.defaults.alpha)) {
    throw new Error('Default alpha tidak ditemukan pada alphaOptions.');
  }

  const positiveIntegerDefaults = [
    ['regressionPredictAhead', config.defaults.regressionPredictAhead],
    ['datasetPageSize', config.defaults.datasetPageSize],
  ];
  for (const [key, value] of positiveIntegerDefaults) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`Default ${key} harus berupa bilangan bulat positif.`);
    }
  }
  if (!Number.isInteger(config.defaults.poissonTargetX) || config.defaults.poissonTargetX < 0) {
    throw new Error('Default poissonTargetX harus berupa bilangan bulat non-negatif.');
  }

  return config;
}

