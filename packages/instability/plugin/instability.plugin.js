const { dependencies } = require("webpack");

const LIB_CODE = "node_modules";
const PLUGIN = "TraverseModuleGraphPlugin";

class TraverseModuleGraphPlugin {
  constructor() {
    this.depth = 0;
    this.importsByModule = {};
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN, (compilation) => {
      compilation.hooks.finishModules.tap(PLUGIN, (modules) => {
        const userModules = this.getUserModules(modules);

        userModules.forEach((module) => {
          if (module?.resourceResolveData?.relativePath) {
            console.log(
              `📦 Module: ${module.resourceResolveData?.relativePath}`
            );
            const dependencies = module.dependencies;
            // this.findCircularDependencies(dependencies, compilation);
            this.dfs(module, compilation);
            this.countImports(module, compilation);
          }
        });
      });
    });
  }

  // Recursive helper function to count imports for a module
  countImports(module, compilation) {
    // const importsByModule = {};

    const maxDepth = 10;
    let depth = 0;

    if (this.depth > maxDepth) {
      this.depth = 0;
      return;
    }

    const { rawRequest } = module;
    // Check if the module has any dependencies
    if (module.dependencies && module.dependencies.length > 0) {
      // Iterate over each dependency and recursively call countImports
      for (const dependency of module.dependencies) {
        // const depModule = compilation.getModule(dependency);
        depth++;
        if (dependency) {
          const dep = compilation.moduleGraph.getModule(dependency);

          if (dep?.rawRequest) {
            // update the importsByModule object
            if (!this.importsByModule[rawRequest]) {
              this.importsByModule[rawRequest] = [];
            }

            this.importsByModule[rawRequest].push(dep.rawRequest);

            console.log(
              `|${" ".repeat(this.depth)}⬇  Imports: ${dep.rawRequest}`
            );
          }

          this.countImports(dependency, compilation);
        }
      }
    }

    console.log(convertModuleGraph(this.importsByModule));

    return convertModuleGraph(this.importsByModule);
  }

  findCircularDependencies(modules, compilation) {
    const maxDepth = 10;

    const circularDependencies = [];

    if (this.depth > maxDepth) {
      this.depth = 0;
      return;
    }

    for (const module of modules) {
      this.depth++;
      const modulePath = module.resourceResolveData?.relativePath;
      const dependencies = module?.dependencies?.map((dep) =>
        compilation.moduleGraph.getModule(dep)
      );

      if (!dependencies) {
        return;
      }
      for (const dep of dependencies) {
        if (dep && dep.resourceResolveData?.relativePath === modulePath) {
          circularDependencies.push(modulePath);
          break;
        }
      }
    }

    return circularDependencies;
  }

  getUserModules(modules) {
    return (
      Array.from(modules)?.filter((module) => {
        return !module?.resource?.includes(LIB_CODE);
      }) ?? []
    );
  }

  dfs(module, compilation) {
    const maxDepth = 10;
    let depth = 0;

    if (this.depth > maxDepth) {
      this.depth = 0;
      return;
    }
    const dependencies = module?.dependencies ?? [];
    if (dependencies.length < 1) {
      console.log(`|${" ".repeat(this.depth)}✅ No deps: `);
      return;
    }
    for (const dep of dependencies) {
      this.depth++;
      const dependency = compilation.moduleGraph.getModule(dep);
      if (dependency) {
        console.log(
          `|${" ".repeat(this.depth)}⬇️  Imports: ${dependency.rawRequest}`
        );
        this.dfs(dependency, compilation); // Recurse the dependent module's dependencies
      } else {
        this.depth = 0;
      }
    }
  }
}

function convertModuleGraph(moduleGraph) {
  const importedBy = {};

  // Iterate over each module in the module graph
  for (const module in moduleGraph) {
    const imports = moduleGraph[module];

    // Iterate over each import of the current module
    for (const importedModule of imports) {
      // Check if the imported module is already in the importedBy object
      if (importedBy[importedModule]) {
        importedBy[importedModule].push(module);
      } else {
        importedBy[importedModule] = [module];
      }
    }
  }

  return importedBy;
}

module.exports = TraverseModuleGraphPlugin;

// for each module in the compilation

// compiler.hooks.compilation.tap(
//   "TraverseModuleGraphPlugin",
//   (compilation) => {
//     compilation.hooks.succeedModule.tap(
//       "TraverseModuleGraphPlugin",
//       (module) => {
//         // Access the module and perform any desired operations
//         const resource = module?.resource || "no resource";
//         console.log(resource);

//       }
//     );
//   }
// );
