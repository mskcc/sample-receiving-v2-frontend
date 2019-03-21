// prep response data for HandsOnTable
// columnHeaders = displayed column names
// features = field/data name, patterns, dropdowns...
// rows = data object, will be modified in place by hands on table
export const generateGridData = (responseColumns, formValues) => {
  let grid = { columnFeatures: [], columnHeaders: [], rows: [] }
  grid.columnFeatures = generateColumnFeatures(responseColumns)
  grid.columnHeaders = grid.columnFeatures.map(a => a.columnHeader)
  grid.rows = generateRows(
    grid.columnFeatures,
    formValues,
    formValues.number_of_samples
  )
  return grid
}

function extractValues(mappings) {
  let result = mappings.map(a => a.value)
  return result
}

function generateColumnFeatures(responseColumns) {
  let columnFeatures = []
  for (let i = 0; i < responseColumns.length; i++) {
    columnFeatures[i] = responseColumns[i]
    if ('source' in responseColumns[i]) {
      // TODO map backwards on submit or find way to keep tumorType id
      columnFeatures[i].source = extractValues(responseColumns[i].source)
      columnFeatures[i].trimDropdown = false
    }
  }
  return columnFeatures
}

function generateRows(columns, formValues, numberToAdd) {
  let rows = []
  for (let i = 0; i < numberToAdd; i++) {
    for (let j = 0; j < columns.length; j++) {
      if (columns[j].data == 'species' || columns[j].data == 'organism') {
        rows[i] = { ...rows[i], [columns[j].data]: formValues.species }
      } else {
        rows[i] = { ...rows[i], [columns[j].data]: '' }
      }
    }
  }
  return rows
}

// helper to compare header.formState and grid.formValues to see which columns need to be updated
// returns obj2 where it differs from obj1
// returns undefined if they are the same
export const diff = (obj1, obj2) => {
  const result = {}
  if (Object.is(obj1, obj2)) {
    return undefined
  }
  if (!obj2 || typeof obj2 !== 'object') {
    return obj2
  }
  Object.keys(obj1 || {})
    .concat(Object.keys(obj2 || {}))
    .forEach(key => {
      if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
        result[key] = obj2[key]
      }
      if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
        const value = diff(obj1[key], obj2[key])
        if (value !== undefined) {
          result[key] = value
        }
      }
    })
  return result
}

// update rows on #samples change without losing data
export const updateRows = (formValues, grid) => {
  let newNumOfSamples = formValues.number_of_samples
  let oldNumOfSamples = grid.form.number_of_samples
  let rows = []
  if (oldNumOfSamples < newNumOfSamples) {
    let numOfRowsToGen = newNumOfSamples - oldNumOfSamples
    rows = grid.rows
    let newRows = generateRows(grid.columnFeatures, formValues, numOfRowsToGen)
    rows = rows.concat(newRows)
  } else {
    // TODO slice or similar?
    for (let i = 0; i < newNumOfSamples; i++) {
      rows[i] = grid.rows[i]
    }
  }
  return rows
}
