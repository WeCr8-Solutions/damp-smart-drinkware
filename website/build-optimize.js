#!/usr/bin/env node

/**
 * DAMP Website Build Optimization Script
 * Minifies CSS and JS files for production deployment
 * Addresses Lighthouse performance recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DAMPBuildOptimizer {
    constructor() {
        this.projectRoot = __dirname;
        this.assetsDir = path.join(this.projectRoot, 'assets');
        this.cssDir = path.join(this.assetsDir, 'css');
        this.jsDir = path.join(this.assetsDir, 'js');
        this.distDir = path.join(this.projectRoot, 'dist');

        this.stats = {
            cssFiles: 0,
            jsFiles: 0,
            originalSize: 0,
            optimizedSize: 0
        };
    }

    async optimize() {
        console.log('🚀 Starting DAMP Website Optimization...');

        try {
            // Create dist directory
            this.createDistDirectory();

            // Install dependencies if needed
            await this.ensureDependencies();

            // Optimize CSS files
            await this.optimizeCSS();

            // Optimize JavaScript files
            await this.optimizeJS();

            // Copy optimized files
            this.copyOptimizedFiles();

            // Generate report
            this.generateReport();

            console.log('✅ Optimization complete!');

        } catch (error) {
            console.error('❌ Optimization failed:', error.message);
            console.log('🔄 Attempting fallback build...');
            
            try {
                // Create basic dist directory with unoptimized files
                this.createFallbackBuild();
                console.log('✅ Fallback build completed successfully');
            } catch (fallbackError) {
                console.error('❌ Fallback build also failed:', fallbackError.message);
                process.exit(1);
            }
        }
    }

    createDistDirectory() {
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir, { recursive: true });
        }

        // Create subdirectories
        const subdirs = ['assets/css', 'assets/js'];
        subdirs.forEach(subdir => {
            const fullPath = path.join(this.distDir, subdir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        });
    }

    async ensureDependencies() {
        console.log('📦 Checking dependencies...');

        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        let packageJson = {};

        if (fs.existsSync(packageJsonPath)) {
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        }

        // Ensure required dependencies
        const requiredDeps = {
            'cssnano': '^6.0.0',
            'postcss': '^8.4.0',
            'terser': '^5.16.0'
        };

        let needsInstall = false;
        const devDependencies = packageJson.devDependencies || {};

        for (const [dep, version] of Object.entries(requiredDeps)) {
            if (!devDependencies[dep]) {
                needsInstall = true;
                break;
            }
        }

        if (needsInstall) {
            console.log('📦 Installing optimization dependencies...');
            try {
                execSync('npm install --save-dev cssnano postcss terser', {
                    stdio: 'inherit',
                    cwd: this.projectRoot
                });
            } catch (error) {
                console.warn('⚠️  Could not install dependencies. Using basic minification.');
            }
        }
    }

    async optimizeCSS() {
        console.log('🎨 Optimizing CSS files...');

        const cssFiles = this.findFiles(this.cssDir, '.css');

        for (const file of cssFiles) {
            await this.minifyCSS(file);
        }

        this.stats.cssFiles = cssFiles.length;
    }

    async minifyCSS(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = content.length;
        this.stats.originalSize += originalSize;

        try {
            // Try using cssnano if available
            const cssnano = require('cssnano');
            const postcss = require('postcss');

            const result = await postcss([
                cssnano({
                    preset: ['default', {
                        discardComments: { removeAll: true },
                        normalizeWhitespace: true,
                        minifySelectors: true,
                        minifyParams: true
                    }]
                })
            ]).process(content, { from: filePath });

            const minified = result.css;
            const optimizedSize = minified.length;
            this.stats.optimizedSize += optimizedSize;

            // Write minified file
            const relativePath = path.relative(this.assetsDir, filePath);
            const outputPath = path.join(this.distDir, 'assets', relativePath);

            // Ensure directory exists
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, minified);

            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            console.log(`  ✓ ${relativePath} - ${savings}% smaller`);

        } catch (error) {
            // Fallback to basic minification
            const minified = this.basicMinifyCSS(content);
            const optimizedSize = minified.length;
            this.stats.optimizedSize += optimizedSize;

            const relativePath = path.relative(this.assetsDir, filePath);
            const outputPath = path.join(this.distDir, 'assets', relativePath);

            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, minified);

            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            console.log(`  ✓ ${relativePath} - ${savings}% smaller (basic)`);
        }
    }

    basicMinifyCSS(css) {
        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around specific characters
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remove trailing semicolons
            .replace(/;}/g, '}')
            // Remove leading/trailing whitespace
            .trim();
    }

    async optimizeJS() {
        console.log('⚡ Optimizing JavaScript files...');

        const jsFiles = this.findFiles(this.jsDir, '.js');

        for (const file of jsFiles) {
            await this.minifyJS(file);
        }

        this.stats.jsFiles = jsFiles.length;
    }

    async minifyJS(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = content.length;
        this.stats.originalSize += originalSize;

        try {
            // Try using Terser if available
            const { minify } = require('terser');

            const result = await minify(content, {
                compress: {
                    drop_console: false, // Keep console logs for debugging
                    drop_debugger: true,
                    dead_code: true,
                    unused: true
                },
                mangle: {
                    toplevel: false,
                    safari10: true
                },
                format: {
                    comments: false
                }
            });

            const minified = result.code;
            const optimizedSize = minified.length;
            this.stats.optimizedSize += optimizedSize;

            // Write minified file
            const relativePath = path.relative(this.assetsDir, filePath);
            const outputPath = path.join(this.distDir, 'assets', relativePath);

            // Ensure directory exists
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, minified);

            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            console.log(`  ✓ ${relativePath} - ${savings}% smaller`);

        } catch (error) {
            // Fallback to basic minification
            const minified = this.basicMinifyJS(content);
            const optimizedSize = minified.length;
            this.stats.optimizedSize += optimizedSize;

            const relativePath = path.relative(this.assetsDir, filePath);
            const outputPath = path.join(this.distDir, 'assets', relativePath);

            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, minified);

            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            console.log(`  ✓ ${relativePath} - ${savings}% smaller (basic)`);
        }
    }

    basicMinifyJS(js) {
        return js
            // Remove single-line comments (but preserve URLs)
            .replace(/\/\/(?![^\r\n]*https?:\/\/)[^\r\n]*/g, '')
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove whitespace around operators
            .replace(/\s*([=+\-*/%<>!&|^~?:;,(){}[\]])\s*/g, '$1')
            // Remove trailing semicolons before }
            .replace(/;}/g, '}')
            // Remove leading/trailing whitespace
            .trim();
    }

    findFiles(dir, extension) {
        let files = [];

        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files = files.concat(this.findFiles(fullPath, extension));
            } else if (path.extname(item) === extension) {
                files.push(fullPath);
            }
        }

        return files;
    }

    copyOptimizedFiles() {
        console.log('📁 Copying additional files...');

        // Copy HTML files and root files
        const rootFiles = ['index.html', 'manifest.json', 'robots.txt', 'sitemap.xml', 
                          'sw.js', 'firebase-messaging-sw.js', 'browserconfig.xml', 'ads.txt'];
        rootFiles.forEach(file => {
            const src = path.join(this.projectRoot, file);
            const dest = path.join(this.distDir, file);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                console.log(`  ✓ ${file}`);
            }
        });

        // Copy images directory
        const imagesDir = path.join(this.assetsDir, 'images');
        const destImagesDir = path.join(this.distDir, 'assets', 'images');
        if (fs.existsSync(imagesDir)) {
            this.copyDirectory(imagesDir, destImagesDir);
            console.log('  ✓ images/');
        }

        // Copy pages directory
        const pagesDir = path.join(this.projectRoot, 'pages');
        const destPagesDir = path.join(this.distDir, 'pages');
        if (fs.existsSync(pagesDir)) {
            this.copyDirectory(pagesDir, destPagesDir);
            console.log('  ✓ pages/');
        }
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const items = fs.readdirSync(src);

        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            const stat = fs.statSync(srcPath);

            if (stat.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    generateReport() {
        const totalSavings = this.stats.originalSize - this.stats.optimizedSize;
        const savingsPercent = ((totalSavings / this.stats.originalSize) * 100).toFixed(1);

        console.log('\n📊 Optimization Report:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`CSS Files Optimized: ${this.stats.cssFiles}`);
        console.log(`JS Files Optimized: ${this.stats.jsFiles}`);
        console.log(`Original Size: ${this.formatBytes(this.stats.originalSize)}`);
        console.log(`Optimized Size: ${this.formatBytes(this.stats.optimizedSize)}`);
        console.log(`Total Savings: ${this.formatBytes(totalSavings)} (${savingsPercent}%)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Optimized files saved to: ${this.distDir}`);

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            totalSavings,
            savingsPercent: parseFloat(savingsPercent)
        };

        fs.writeFileSync(
            path.join(this.distDir, 'optimization-report.json'),
            JSON.stringify(report, null, 2)
        );
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    createFallbackBuild() {
        console.log('🔄 Creating fallback build without optimization...');
        
        // Create dist directory
        this.createDistDirectory();
        
        // Copy files without optimization
        const copyRecursive = (src, dest) => {
            if (fs.existsSync(src)) {
                const stats = fs.statSync(src);
                if (stats.isDirectory()) {
                    if (!fs.existsSync(dest)) {
                        fs.mkdirSync(dest, { recursive: true });
                    }
                    fs.readdirSync(src).forEach(item => {
                        copyRecursive(path.join(src, item), path.join(dest, item));
                    });
                } else {
                    fs.copyFileSync(src, dest);
                }
            }
        };

        // Copy assets
        if (fs.existsSync(this.assetsDir)) {
            copyRecursive(this.assetsDir, path.join(this.distDir, 'assets'));
        }

        // Copy HTML files
        const htmlFiles = fs.readdirSync(this.projectRoot).filter(file => file.endsWith('.html'));
        htmlFiles.forEach(file => {
            fs.copyFileSync(
                path.join(this.projectRoot, file),
                path.join(this.distDir, file)
            );
        });

        // Copy pages directory if it exists
        const pagesDir = path.join(this.projectRoot, 'pages');
        if (fs.existsSync(pagesDir)) {
            copyRecursive(pagesDir, path.join(this.distDir, 'pages'));
        }

        // Copy other important files
        const importantFiles = ['manifest.json', 'robots.txt', 'sitemap.xml', 'sw.js', 'firebase-messaging-sw.js'];
        importantFiles.forEach(file => {
            const srcPath = path.join(this.projectRoot, file);
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, path.join(this.distDir, file));
            }
        });

        console.log('✅ Fallback build completed - files copied without optimization');
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new DAMPBuildOptimizer();
    optimizer.optimize();
}

module.exports = DAMPBuildOptimizer;
