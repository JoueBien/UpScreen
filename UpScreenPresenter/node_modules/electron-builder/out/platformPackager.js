"use strict";

const metadata_1 = require("./metadata");
const bluebird_1 = require("bluebird");
const path = require("path");
const fs_extra_p_1 = require("fs-extra-p");
const util_1 = require("./util/util");
const archive_1 = require("./targets/archive");
const asarUtil_1 = require("./asarUtil");
const log_1 = require("./util/log");
const filter_1 = require("./util/filter");
const dirPackager_1 = require("./packager/dirPackager");
const fileMatcher_1 = require("./fileMatcher");
//noinspection JSUnusedLocalSymbols
const __awaiter = require("./util/awaiter");
class Target {
    constructor(name) {
        this.name = name;
    }
    finishBuild() {
        return bluebird_1.Promise.resolve();
    }
}
exports.Target = Target;
class TargetEx extends Target {}
exports.TargetEx = TargetEx;
class PlatformPackager {
    constructor(info) {
        this.info = info;
        this.devMetadata = info.devMetadata;
        this.platformSpecificBuildOptions = this.normalizePlatformSpecificBuildOptions(info.devMetadata.build[this.platform.buildConfigurationKey]);
        this.appInfo = this.prepareAppInfo(info.appInfo);
        this.options = info.options;
        this.projectDir = info.projectDir;
        this.buildResourcesDir = path.resolve(this.projectDir, this.relativeBuildResourcesDirname);
        this.resourceList = fs_extra_p_1.readdir(this.buildResourcesDir).catch(e => {
            if (e.code !== "ENOENT") {
                throw e;
            }
            return [];
        });
    }
    get platform() {}
    prepareAppInfo(appInfo) {
        return appInfo;
    }
    normalizePlatformSpecificBuildOptions(options) {
        return options == null ? Object.create(null) : options;
    }
    getCscPassword() {
        const password = this.options.cscKeyPassword || process.env.CSC_KEY_PASSWORD;
        if (util_1.isEmptyOrSpaces(password)) {
            log_1.log("CSC_KEY_PASSWORD is not defined, empty password will be used");
            return "";
        } else {
            return password.trim();
        }
    }
    get relativeBuildResourcesDirname() {
        return util_1.use(this.devMetadata.directories, it => it.buildResources) || "build";
    }
    computeAppOutDir(outDir, arch) {
        return path.join(outDir, `${ this.platform.buildConfigurationKey }${ getArchSuffix(arch) }${ this.platform === metadata_1.Platform.MAC ? "" : "-unpacked" }`);
    }
    dispatchArtifactCreated(file, artifactName) {
        this.info.eventEmitter.emit("artifactCreated", {
            file: file,
            artifactName: artifactName,
            platform: this.platform,
            packager: this
        });
    }
    getExtraFileMatchers(isResources, appOutDir, fileMatchOptions, customBuildOptions) {
        const base = isResources ? this.getResourcesDir(appOutDir) : this.platform === metadata_1.Platform.MAC ? path.join(appOutDir, `${ this.appInfo.productFilename }.app`, "Contents") : appOutDir;
        return this.getFileMatchers(isResources ? "extraResources" : "extraFiles", this.projectDir, base, true, fileMatchOptions, customBuildOptions);
    }
    doPack(options, outDir, appOutDir, platformName, arch, platformSpecificBuildOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const asarOptions = this.computeAsarOptions(platformSpecificBuildOptions);
            const fileMatchOptions = {
                arch: metadata_1.Arch[arch],
                os: this.platform.buildConfigurationKey
            };
            const extraResourceMatchers = this.getExtraFileMatchers(true, appOutDir, fileMatchOptions, platformSpecificBuildOptions);
            const extraFileMatchers = this.getExtraFileMatchers(false, appOutDir, fileMatchOptions, platformSpecificBuildOptions);
            const resourcesPath = this.platform === metadata_1.Platform.MAC ? path.join(appOutDir, "Electron.app", "Contents", "Resources") : path.join(appOutDir, "resources");
            const p = dirPackager_1.pack(options, appOutDir, platformName, metadata_1.Arch[arch], this.info.electronVersion, () => __awaiter(this, void 0, void 0, function* () {
                const ignoreFiles = new Set([path.resolve(this.info.appDir, outDir), path.resolve(this.info.appDir, this.buildResourcesDir)]);
                if (!this.info.isTwoPackageJsonProjectLayoutUsed) {
                    const result = yield filter_1.devDependencies(this.info.appDir);
                    for (let it of result) {
                        ignoreFiles.add(it);
                    }
                }
                const patterns = this.getFileMatchers("files", this.info.appDir, path.join(resourcesPath, "app"), false, fileMatchOptions, platformSpecificBuildOptions);
                let defaultMatcher = patterns != null ? patterns[0] : new fileMatcher_1.FileMatcher(this.info.appDir, path.join(resourcesPath, "app"), fileMatchOptions);
                if (defaultMatcher.isEmpty()) {
                    defaultMatcher.addPattern("**/*");
                }
                defaultMatcher.addPattern("!**/node_modules/*/{README.md,README,readme.md,readme,test}");
                let rawFilter = null;
                const deprecatedIgnore = this.devMetadata.build.ignore;
                if (deprecatedIgnore != null) {
                    if (typeof deprecatedIgnore === "function") {
                        log_1.log(`"ignore is specified as function, may be new "files" option will be suit your needs? Please see https://github.com/electron-userland/electron-builder/wiki/Options#BuildMetadata-files`);
                    } else {
                        log_1.warn(`"ignore is deprecated, please use "files", see https://github.com/electron-userland/electron-builder/wiki/Options#BuildMetadata-files`);
                    }
                    rawFilter = fileMatcher_1.deprecatedUserIgnoreFilter(deprecatedIgnore, this.info.appDir);
                }
                let excludePatterns = [];
                if (extraResourceMatchers != null) {
                    for (let i = 0; i < extraResourceMatchers.length; i++) {
                        const patterns = extraResourceMatchers[i].getParsedPatterns(this.info.projectDir);
                        excludePatterns = excludePatterns.concat(patterns);
                    }
                }
                if (extraFileMatchers != null) {
                    for (let i = 0; i < extraFileMatchers.length; i++) {
                        const patterns = extraFileMatchers[i].getParsedPatterns(this.info.projectDir);
                        excludePatterns = excludePatterns.concat(patterns);
                    }
                }
                const filter = defaultMatcher.createFilter(ignoreFiles, rawFilter, excludePatterns.length ? excludePatterns : null);
                const promise = asarOptions == null ? filter_1.copyFiltered(this.info.appDir, path.join(resourcesPath, "app"), filter, this.info.devMetadata.build.dereference || this.platform === metadata_1.Platform.WINDOWS) : asarUtil_1.createAsarArchive(this.info.appDir, resourcesPath, asarOptions, filter);
                const promises = [promise, util_1.unlinkIfExists(path.join(resourcesPath, "default_app.asar")), util_1.unlinkIfExists(path.join(appOutDir, "version"))];
                if (this.info.electronVersion[0] === "0") {
                    // electron release >= 0.37.4 - the default_app/ folder is a default_app.asar file
                    promises.push(fs_extra_p_1.remove(path.join(resourcesPath, "default_app")));
                }
                promises.push(this.postInitApp(appOutDir));
                yield bluebird_1.Promise.all(promises);
            }));
            yield log_1.task(`Packaging for platform ${ platformName } ${ metadata_1.Arch[arch] } using electron ${ this.info.electronVersion } to ${ path.relative(this.projectDir, appOutDir) }`, p);
            yield this.doCopyExtraFiles(extraResourceMatchers);
            yield this.doCopyExtraFiles(extraFileMatchers);
            const afterPack = this.devMetadata.build.afterPack;
            if (afterPack != null) {
                yield afterPack({
                    appOutDir: appOutDir,
                    options: options
                });
            }
            yield this.sanityCheckPackage(appOutDir, asarOptions != null);
        });
    }
    postInitApp(executableFile) {
        return bluebird_1.Promise.resolve(null);
    }
    computePackOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            //noinspection JSUnusedGlobalSymbols
            const appInfo = this.appInfo;
            const options = Object.assign({
                appInfo: appInfo,
                platformPackager: this
            }, this.devMetadata.build);
            delete options.osx;
            delete options.win;
            delete options.linux;
            return options;
        });
    }
    getIconPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    computeAsarOptions(customBuildOptions) {
        let result = this.devMetadata.build.asar;
        let platformSpecific = customBuildOptions.asar;
        if (platformSpecific != null) {
            result = platformSpecific;
        }
        if (result === false) {
            return null;
        }
        const buildMetadata = this.devMetadata.build;
        if (buildMetadata["asar-unpack"] != null) {
            log_1.warn("asar-unpack is deprecated, please set as asar.unpack");
        }
        if (buildMetadata["asar-unpack-dir"] != null) {
            log_1.warn("asar-unpack-dir is deprecated, please set as asar.unpackDir");
        }
        if (result == null || result === true) {
            result = {
                unpack: buildMetadata["asar-unpack"],
                unpackDir: buildMetadata["asar-unpack-dir"]
            };
        }
        return Object.assign(result, {
            extraMetadata: this.options.extraMetadata
        });
    }
    doCopyExtraFiles(patterns) {
        if (patterns == null || patterns.length === 0) {
            return bluebird_1.Promise.resolve();
        } else {
            const promises = [];
            for (let i = 0; i < patterns.length; i++) {
                if (patterns[i].isEmpty()) {
                    patterns[i].addPattern("**/*");
                }
                promises.push(filter_1.copyFiltered(patterns[i].from, patterns[i].to, patterns[i].createFilter(), this.platform === metadata_1.Platform.WINDOWS));
            }
            return bluebird_1.Promise.all(promises);
        }
    }
    getFileMatchers(name, defaultSrc, defaultDest, allowAdvancedMatching, fileMatchOptions, customBuildOptions) {
        let globalPatterns = this.devMetadata.build[name];
        let platformSpecificPatterns = customBuildOptions[name];
        const defaultMatcher = new fileMatcher_1.FileMatcher(defaultSrc, defaultDest, fileMatchOptions);
        const fileMatchers = [];
        function addPatterns(patterns) {
            if (patterns == null) {
                return;
            } else if (!Array.isArray(patterns)) {
                defaultMatcher.addPattern(patterns);
                return;
            }
            for (let i = 0; i < patterns.length; i++) {
                const pattern = patterns[i];
                if (typeof pattern === "string") {
                    defaultMatcher.addPattern(pattern);
                } else if (allowAdvancedMatching) {
                    const from = pattern.from ? path.isAbsolute(pattern.from) ? pattern.from : path.join(defaultSrc, pattern.from) : defaultSrc;
                    const to = pattern.to ? path.isAbsolute(pattern.to) ? pattern.to : path.join(defaultDest, pattern.to) : defaultDest;
                    fileMatchers.push(new fileMatcher_1.FileMatcher(from, to, fileMatchOptions, pattern.filter));
                } else {
                    throw new Error(`Advanced file copying not supported for "${ name }"`);
                }
            }
        }
        addPatterns(globalPatterns);
        addPatterns(platformSpecificPatterns);
        if (!defaultMatcher.isEmpty()) {
            // Default matcher should be first in the array
            fileMatchers.unshift(defaultMatcher);
        }
        return fileMatchers.length ? fileMatchers : null;
    }
    getResourcesDir(appOutDir) {
        return this.platform === metadata_1.Platform.MAC ? this.getOSXResourcesDir(appOutDir) : path.join(appOutDir, "resources");
    }
    getOSXResourcesDir(appOutDir) {
        return path.join(appOutDir, `${ this.appInfo.productFilename }.app`, "Contents", "Resources");
    }
    checkFileInPackage(resourcesDir, file, messagePrefix, isAsar) {
        return __awaiter(this, void 0, void 0, function* () {
            const relativeFile = path.relative(this.info.appDir, path.resolve(this.info.appDir, file));
            if (isAsar) {
                yield asarUtil_1.checkFileInArchive(path.join(resourcesDir, "app.asar"), relativeFile, messagePrefix);
            } else {
                const outStat = yield util_1.statOrNull(path.join(resourcesDir, "app", relativeFile));
                if (outStat == null) {
                    throw new Error(`${ messagePrefix } "${ relativeFile }" does not exist. Seems like a wrong configuration.`);
                } else if (!outStat.isFile()) {
                    throw new Error(`${ messagePrefix } "${ relativeFile }" is not a file. Seems like a wrong configuration.`);
                }
            }
        });
    }
    sanityCheckPackage(appOutDir, isAsar) {
        return __awaiter(this, void 0, void 0, function* () {
            const outStat = yield util_1.statOrNull(appOutDir);
            if (outStat == null) {
                throw new Error(`Output directory "${ appOutDir }" does not exist. Seems like a wrong configuration.`);
            } else if (!outStat.isDirectory()) {
                throw new Error(`Output directory "${ appOutDir }" is not a directory. Seems like a wrong configuration.`);
            }
            const resourcesDir = this.getResourcesDir(appOutDir);
            yield this.checkFileInPackage(resourcesDir, this.appInfo.metadata.main || "index.js", "Application entry file", isAsar);
            yield this.checkFileInPackage(resourcesDir, "package.json", "Application", isAsar);
        });
    }
    archiveApp(format, appOutDir, outFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return archive_1.archiveApp(this.devMetadata.build.compression, format, outFile, this.platform === metadata_1.Platform.MAC ? path.join(appOutDir, `${ this.appInfo.productFilename }.app`) : appOutDir);
        });
    }
    generateName(ext, arch, deployment) {
        let classifier = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        let c = arch === metadata_1.Arch.x64 ? ext === "AppImage" ? "x86_64" : null : metadata_1.Arch[arch];
        if (c == null) {
            c = classifier;
        } else if (classifier != null) {
            c += `-${ classifier }`;
        }
        return this.generateName2(ext, c, deployment);
    }
    generateName2(ext, classifier, deployment) {
        const dotExt = ext == null ? "" : `.${ ext }`;
        return `${ deployment ? this.appInfo.name : this.appInfo.productFilename }-${ this.appInfo.version }${ classifier == null ? "" : `-${ classifier }` }${ dotExt }`;
    }
    getDefaultIcon(ext) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceList = yield this.resourceList;
            const name = `icon.${ ext }`;
            if (resourceList.indexOf(name) !== -1) {
                return path.join(this.buildResourcesDir, name);
            } else {
                log_1.warn("Application icon is not set, default Electron icon will be used");
                return null;
            }
        });
    }
    getTempFile(suffix) {
        return this.info.tempDirManager.getTempFile(suffix);
    }
    getFileAssociations() {
        return util_1.asArray(this.devMetadata.build.fileAssociations).concat(util_1.asArray(this.platformSpecificBuildOptions.fileAssociations));
    }
    getResource(custom, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = custom;
            if (result === undefined) {
                const resourceList = yield this.resourceList;
                if (resourceList.indexOf(name) !== -1) {
                    return path.join(this.buildResourcesDir, name);
                }
            } else {
                return path.resolve(this.projectDir, result);
            }
            return null;
        });
    }
}
exports.PlatformPackager = PlatformPackager;
function getArchSuffix(arch) {
    return arch === metadata_1.Arch.x64 ? "" : `-${ metadata_1.Arch[arch] }`;
}
exports.getArchSuffix = getArchSuffix;
// fpm bug - rpm build --description is not escaped, well... decided to replace quite to smart quote
// http://leancrew.com/all-this/2010/11/smart-quotes-in-javascript/
function smarten(s) {
    // opening singles
    s = s.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");
    // closing singles & apostrophes
    s = s.replace(/'/g, "\u2019");
    // opening doubles
    s = s.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c");
    // closing doubles
    s = s.replace(/"/g, "\u201d");
    return s;
}
exports.smarten = smarten;
// remove leading dot
function normalizeExt(ext) {
    return ext.startsWith(".") ? ext.substring(1) : ext;
}
exports.normalizeExt = normalizeExt;
//# sourceMappingURL=platformPackager.js.map