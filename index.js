const program = require('commander')
const globby = require('globby')
const path = require('path')
const rimraf = require('rimraf')

program
  .version('1.0.0')
  .option(
    '-p, --base-path <path>',
    'The base directory to search for node_modules'
  )
  .option('-l, --list', 'Lists all found node_modules', false)
  .option('-d, --delete', 'Deletes all found directories', false)
  .parse(process.argv)

async function run() {
  const basePath = program.basePath || '.'
  const paths = await globby(
    [`${basePath}/**/node_modules`, `!${path.resolve('./node_modules')}`],
    {
      onlyFiles: false,
    }
  )
  const rootNodeModulesPaths = paths
    .filter(x => (x.match(/node_modules/g) || []).length === 1)
    .map(x => path.resolve(program.basePath, x))
    .sort()

  console.log(`Found ${rootNodeModulesPaths.length} node_modules directories`)

  if (program.list === true) {
    rootNodeModulesPaths.forEach(x => console.log(` --> ${x}`))
  }

  if (program.delete === true) {
    console.log('Removing node_modules directories...')

    try {
      const dirsToRemove = rootNodeModulesPaths
      await Promise.all(
        dirsToRemove.map(
          x =>
            new Promise((resolve, reject) => {
              rimraf(x, err => (err ? reject(err) : resolve()))
            })
        )
      )
      console.log(`Removed ${dirsToRemove.length} directories.`)
    } catch (err) {
      console.log('Could not remove directories:')
      console.log(err)
    }
  }
}

run()
