import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import fs from "fs-extra";
import path from "path";

async function removeIgnoreDir(dir: string, match_pattern: RegExp[]) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filepath = path.join(dir, file);
      const stat = await fs.stat(filepath);
      if (match_pattern.some((pattern) => file.match(pattern))) {
        await fs.remove(filepath);
        console.log(`remove ${filepath}`);
      } else if (stat.isDirectory()) {
        await removeIgnoreDir(filepath, match_pattern);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    appBundleId: "com.top.tarzipc.app",
    appVersion: "0.1.0",
    appCopyright: "Copyright @ 2024 for tarzipc.top",
    name: "LexiNavigator",
    derefSymlinks: true,
    extendInfo: {
      "NSAppleEventsUsageDescription": "This app requires access to AppleEvents for keyboard hooking",
      "NSAccessibilityUsageDescription": "This app requires access to Accessibility for keyboard hooking",
    },
    afterCopy: [
      async (buildPath, electronVersion, platform, arch, done) => {
        const ignore = [/\.bin$/, /\.cache$/, /@babel*/, /^babel*/, /node_gyp_bins/];
        // const custom_libs = ["kmhook"];
        const source_node_modules = path.join(buildPath, "../../node_modules");
        const dest_node_modules = path.join(buildPath, "node_modules");
        await fs.ensureDir(dest_node_modules);
        if (await fs.pathExists(source_node_modules)) {
          const dirs = await fs.readdir(source_node_modules);
          for (const dir of dirs) {
            const dest = path.join(dest_node_modules, dir);
            if (!fs.pathExistsSync(dest)) {
              await fs.move(path.join(source_node_modules, dir), dest);
            }
          }
          fs.rm(source_node_modules, { force: true, recursive: true });
        }
        await removeIgnoreDir(dest_node_modules, ignore);
        // for (const lib of custom_libs) {
        //   const libpath = path.dirname(require.resolve(lib));
        //   await fs.copy(libpath, path.join(dest_node_modules, lib), { recursive: true });
        // }

        // copy extra system frameworks for macos
        // if (platform == "darwin") {
        //   const frameworks = ["ApplicationServices.framework"];
        //   const target_frameworks_path = path.join(buildPath, "../../Frameworks");
        //   fs.ensureDirSync(target_frameworks_path);
        //   for (const framework of frameworks) {
        //     const source_framework_path = path.join("/System/Library/Frameworks", framework);
        //     await fs.copy(source_framework_path, path.join(target_frameworks_path, framework), { recursive: true });
        //   }
        // }

        done();
      },
    ],
  },
  hooks: {
    packageAfterCopy: async (forgeconfig, buildPath, electronVersion, platform, arch) => {
      const custom_libs = ["kmhook"];
      const dest_node_modules = path.join(buildPath, "node_modules");
      await fs.ensureDir(dest_node_modules);
      for (const lib of custom_libs) {
        const libpath = path.dirname(require.resolve(lib));
        await fs.copy(libpath, path.join(dest_node_modules, lib), { recursive: true });
      }
    }
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ["darwin"]), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
