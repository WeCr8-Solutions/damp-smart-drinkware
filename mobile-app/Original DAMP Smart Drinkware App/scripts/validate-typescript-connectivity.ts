#!/usr/bin/env npx tsx

/**
 * 🔍 DAMP Smart Drinkware - TypeScript Connectivity Validator
 * Validates circular loop system and identifies dead ends in TypeScript configuration
 * Copyright 2025 WeCr8 Solutions LLC
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

interface ModuleInfo {
  name: string;
  path: string;
  exports: string[];
  imports: string[];
  dependencies: string[];
  circularRefs: string[];
  hasIndex: boolean;
  isConnected: boolean;
}

interface ConnectivityReport {
  totalModules: number;
  connectedModules: number;
  disconnectedModules: string[];
  circularReferences: string[];
  deadEnds: string[];
  pathMappings: Record<string, boolean>;
  typeConnectivity: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

class TypeScriptConnectivityValidator {
  private baseDir: string;
  private tsConfig: any;
  private modules: Map<string, ModuleInfo> = new Map();

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir;
    this.loadTsConfig();
  }

  private loadTsConfig(): void {
    const tsConfigPath = join(this.baseDir, 'tsconfig.json');

    if (!existsSync(tsConfigPath)) {
      throw new Error('tsconfig.json not found');
    }

    try {
      const tsConfigContent = readFileSync(tsConfigPath, 'utf8');
      this.tsConfig = JSON.parse(tsConfigContent);
    } catch (error) {
      throw new Error(`Failed to parse tsconfig.json: ${error}`);
    }
  }

  private scanDirectory(dir: string): void {
    const fullPath = join(this.baseDir, dir);

    if (!existsSync(fullPath)) return;

    const entries = readdirSync(fullPath);

    entries.forEach(entry => {
      const entryPath = join(fullPath, entry);
      const stat = statSync(entryPath);

      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        // Check if directory has an index file
        const hasIndex = this.hasIndexFile(entryPath);
        const relativePath = join(dir, entry).replace(/\\/g, '/');

        const moduleInfo: ModuleInfo = {
          name: entry,
          path: relativePath,
          exports: [],
          imports: [],
          dependencies: [],
          circularRefs: [],
          hasIndex,
          isConnected: false
        };

        if (hasIndex) {
          this.analyzeIndexFile(entryPath, moduleInfo);
        }

        this.modules.set(relativePath, moduleInfo);

        // Recursively scan subdirectories
        this.scanDirectory(relativePath);
      }
    });
  }

  private hasIndexFile(dirPath: string): boolean {
    const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
    return indexFiles.some(file => existsSync(join(dirPath, file)));
  }

  private analyzeIndexFile(dirPath: string, moduleInfo: ModuleInfo): void {
    const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
    let indexFile: string | null = null;

    for (const file of indexFiles) {
      const filePath = join(dirPath, file);
      if (existsSync(filePath)) {
        indexFile = filePath;
        break;
      }
    }

    if (!indexFile) return;

    try {
      const content = readFileSync(indexFile, 'utf8');

      // Extract exports
      const exportMatches = content.match(/export\s+(?:\{[^}]*\}|[*]|\w+)/g) || [];
      moduleInfo.exports = exportMatches.map(match => match.trim());

      // Extract imports
      const importMatches = content.match(/import\s+.*?from\s+['"][^'"]*['"]/g) || [];
      moduleInfo.imports = importMatches.map(match => {
        const fromMatch = match.match(/from\s+['"]([^'"]*)['"]/);
        return fromMatch ? fromMatch[1] : '';
      }).filter(Boolean);

      // Extract path alias imports
      const pathAliasImports = moduleInfo.imports.filter(imp => imp.startsWith('@/'));
      moduleInfo.dependencies = pathAliasImports;

    } catch (error) {
      console.warn(`Failed to analyze ${indexFile}: ${error}`);
    }
  }

  private validatePathMappings(): Record<string, boolean> {
    const pathMappings = this.tsConfig.compilerOptions?.paths || {};
    const results: Record<string, boolean> = {};

    Object.entries(pathMappings).forEach(([alias, paths]) => {
      if (Array.isArray(paths)) {
        const mappingExists = paths.some(path => {
          const resolvedPath = join(this.baseDir, path.replace('/*', ''));
          return existsSync(resolvedPath);
        });
        results[alias] = mappingExists;
      }
    });

    return results;
  }

  private findCircularReferences(): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (modulePath: string, path: string[] = []): void => {
      if (recursionStack.has(modulePath)) {
        const cycleStart = path.indexOf(modulePath);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat(modulePath);
          circular.push(cycle.join(' -> '));
        }
        return;
      }

      if (visited.has(modulePath)) {
        return;
      }

      visited.add(modulePath);
      recursionStack.add(modulePath);

      const moduleInfo = this.modules.get(modulePath);
      if (moduleInfo) {
        moduleInfo.dependencies.forEach(dep => {
          const depPath = this.resolvePathAlias(dep);
          if (depPath) {
            dfs(depPath, [...path, modulePath]);
          }
        });
      }

      recursionStack.delete(modulePath);
    };

    this.modules.forEach((_, modulePath) => {
      if (!visited.has(modulePath)) {
        dfs(modulePath);
      }
    });

    return circular;
  }

  private resolvePathAlias(alias: string): string | null {
    const pathMappings = this.tsConfig.compilerOptions?.paths || {};

    for (const [pattern, paths] of Object.entries(pathMappings)) {
      if (Array.isArray(paths)) {
        const regex = new RegExp(pattern.replace('*', '(.*)'));
        const match = alias.match(regex);

        if (match) {
          for (const path of paths) {
            const resolved = path.replace('*', match[1] || '');
            const fullPath = resolved.startsWith('./') ? resolved.slice(2) : resolved;

            if (this.modules.has(fullPath)) {
              return fullPath;
            }
          }
        }
      }
    }

    return null;
  }

  private findDeadEnds(): string[] {
    const deadEnds: string[] = [];

    this.modules.forEach((moduleInfo, modulePath) => {
      // Check if module has no exports and no imports
      if (moduleInfo.exports.length === 0 && moduleInfo.imports.length === 0) {
        deadEnds.push(modulePath);
        return;
      }

      // Check if module has exports but is not imported by anyone
      if (moduleInfo.exports.length > 0) {
        const isImportedByOthers = Array.from(this.modules.values()).some(
          otherModule => otherModule.dependencies.some(dep =>
            this.resolvePathAlias(dep) === modulePath
          )
        );

        if (!isImportedByOthers) {
          // Check if it's not a root module (app, components index, etc.)
          const rootModules = ['app', 'components', 'contexts', 'hooks', 'lib', 'utils'];
          if (!rootModules.includes(moduleInfo.name)) {
            deadEnds.push(modulePath);
          }
        }
      }
    });

    return deadEnds;
  }

  private calculateConnectivity(): void {
    const graph = new Map<string, Set<string>>();

    // Build connectivity graph
    this.modules.forEach((moduleInfo, modulePath) => {
      if (!graph.has(modulePath)) {
        graph.set(modulePath, new Set());
      }

      moduleInfo.dependencies.forEach(dep => {
        const depPath = this.resolvePathAlias(dep);
        if (depPath) {
          graph.get(modulePath)!.add(depPath);
        }
      });
    });

    // Mark connected modules using DFS
    const visited = new Set<string>();

    const dfs = (modulePath: string): void => {
      if (visited.has(modulePath)) return;

      visited.add(modulePath);
      const moduleInfo = this.modules.get(modulePath);
      if (moduleInfo) {
        moduleInfo.isConnected = true;
      }

      const connections = graph.get(modulePath) || new Set();
      connections.forEach(connected => dfs(connected));
    };

    // Start DFS from root modules
    const rootModules = ['app', 'components', 'contexts', 'hooks', 'lib', 'utils'];
    rootModules.forEach(root => {
      const rootPath = Array.from(this.modules.keys()).find(path => path.endsWith(root));
      if (rootPath) {
        dfs(rootPath);
      }
    });
  }

  public validate(): ConnectivityReport {
    console.log(`${colors.bold}${colors.cyan}🔍 TypeScript Connectivity Validation${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log('');

    // Scan all modules
    console.log(`${colors.blue}📁 Scanning modules...${colors.reset}`);
    const mainDirectories = ['app', 'components', 'contexts', 'hooks', 'lib', 'utils', 'types', 'src'];
    mainDirectories.forEach(dir => this.scanDirectory(dir));
    console.log(`   Found ${this.modules.size} modules`);
    console.log('');

    // Validate path mappings
    console.log(`${colors.blue}🗺️  Validating path mappings...${colors.reset}`);
    const pathMappings = this.validatePathMappings();
    const validMappings = Object.values(pathMappings).filter(Boolean).length;
    const totalMappings = Object.keys(pathMappings).length;
    console.log(`   ${validMappings}/${totalMappings} path mappings are valid`);
    console.log('');

    // Find circular references
    console.log(`${colors.blue}🔄 Checking for circular references...${colors.reset}`);
    const circularReferences = this.findCircularReferences();
    console.log(`   Found ${circularReferences.length} circular reference(s)`);
    if (circularReferences.length > 0) {
      circularReferences.forEach(ref => {
        console.log(`   ${colors.yellow}⚠️  ${ref}${colors.reset}`);
      });
    }
    console.log('');

    // Find dead ends
    console.log(`${colors.blue}🚫 Checking for dead ends...${colors.reset}`);
    const deadEnds = this.findDeadEnds();
    console.log(`   Found ${deadEnds.length} dead end(s)`);
    if (deadEnds.length > 0) {
      deadEnds.forEach(deadEnd => {
        console.log(`   ${colors.red}❌ ${deadEnd}${colors.reset}`);
      });
    }
    console.log('');

    // Calculate connectivity
    console.log(`${colors.blue}🔗 Calculating connectivity...${colors.reset}`);
    this.calculateConnectivity();
    const connectedModules = Array.from(this.modules.values()).filter(m => m.isConnected).length;
    const typeConnectivity = (connectedModules / this.modules.size) * 100;
    console.log(`   ${connectedModules}/${this.modules.size} modules are connected (${typeConnectivity.toFixed(1)}%)`);
    console.log('');

    // Determine system health
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (typeConnectivity < 70 || deadEnds.length > 5) {
      systemHealth = 'critical';
    } else if (typeConnectivity < 85 || deadEnds.length > 2 || circularReferences.length > 3) {
      systemHealth = 'degraded';
    }

    const disconnectedModules = Array.from(this.modules.values())
      .filter(m => !m.isConnected)
      .map(m => m.path);

    const report: ConnectivityReport = {
      totalModules: this.modules.size,
      connectedModules,
      disconnectedModules,
      circularReferences,
      deadEnds,
      pathMappings,
      typeConnectivity,
      systemHealth
    };

    this.displayResults(report);
    return report;
  }

  private displayResults(report: ConnectivityReport): void {
    console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}📊 CONNECTIVITY REPORT${colors.reset}`);
    console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);
    console.log('');

    // Overall health
    const healthColor = report.systemHealth === 'healthy' ? colors.green :
                       report.systemHealth === 'degraded' ? colors.yellow : colors.red;
    const healthIcon = report.systemHealth === 'healthy' ? '✅' :
                      report.systemHealth === 'degraded' ? '⚠️' : '❌';

    console.log(`${colors.bold}System Health: ${healthColor}${healthIcon} ${report.systemHealth.toUpperCase()}${colors.reset}`);
    console.log(`${colors.bold}Type Connectivity: ${report.typeConnectivity.toFixed(1)}%${colors.reset}`);
    console.log('');

    // Detailed metrics
    console.log(`${colors.cyan}📈 Metrics:${colors.reset}`);
    console.log(`  Total Modules: ${report.totalModules}`);
    console.log(`  Connected Modules: ${report.connectedModules}`);
    console.log(`  Disconnected Modules: ${report.disconnectedModules.length}`);
    console.log(`  Circular References: ${report.circularReferences.length}`);
    console.log(`  Dead Ends: ${report.deadEnds.length}`);
    console.log('');

    // Recommendations
    console.log(`${colors.bold}${colors.blue}💡 RECOMMENDATIONS:${colors.reset}`);

    if (report.systemHealth === 'critical') {
      console.log(`${colors.red}🚨 CRITICAL ISSUES DETECTED:${colors.reset}`);
      console.log(`  • System connectivity is below acceptable threshold (${report.typeConnectivity.toFixed(1)}%)`);
      console.log(`  • ${report.deadEnds.length} modules have no connections`);
      console.log(`  • Immediate attention required to fix module connectivity`);
    } else if (report.systemHealth === 'degraded') {
      console.log(`${colors.yellow}⚠️  PERFORMANCE ISSUES:${colors.reset}`);
      console.log(`  • Some modules are not properly connected`);
      console.log(`  • Consider adding index files to improve connectivity`);
      console.log(`  • Review circular references for potential optimization`);
    } else {
      console.log(`${colors.green}✅ SYSTEM IS HEALTHY:${colors.reset}`);
      console.log(`  • All modules are properly connected`);
      console.log(`  • TypeScript configuration supports circular loop system`);
      console.log(`  • No dead ends detected in the module graph`);
    }

    console.log('');
    console.log(`${colors.bold}Generated by DAMP Smart Drinkware TypeScript Connectivity Validator${colors.reset}`);
  }
}

// Main execution
function main(): void {
  try {
    const validator = new TypeScriptConnectivityValidator();
    const report = validator.validate();

    // Exit with appropriate code based on system health
    const exitCode = report.systemHealth === 'critical' ? 1 : 0;
    process.exit(exitCode);

  } catch (error) {
    console.error(`${colors.red}❌ Validation failed: ${error}${colors.reset}`);
    process.exit(1);
  }
}

// Command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`${colors.bold}🔍 TypeScript Connectivity Validator${colors.reset}`);
  console.log('');
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log('  npx tsx scripts/validate-typescript-connectivity.ts [options]');
  console.log('');
  console.log(`${colors.bold}Options:${colors.reset}`);
  console.log('  --help    Show this help message');
  console.log('');
  console.log(`${colors.bold}What this script does:${colors.reset}`);
  console.log('  • Scans all TypeScript modules and their connections');
  console.log('  • Validates path mappings in tsconfig.json');
  console.log('  • Identifies circular references and dead ends');
  console.log('  • Calculates overall system connectivity');
  console.log('  • Provides recommendations for improvements');
  console.log('');
  process.exit(0);
}

// Run the validator
main();